import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import type { IChatRepository } from 'src/modules/chats/infraestructure/chats.repositories.interfaces';
import type { IIntegranteRepository } from 'src/modules/chats/infraestructure/chats.repositories.interfaces';
import { Estado, TipoArchivo, TipoEvento } from 'src/shared/domain/enums';
import type {
  IDetalleMensajeRepository,
  IMensajeRepository,
  IViewerRepository,
} from 'src/modules/mensajes/infraestructure/mensajes.repositories.interfaces';
import { IMensajePrivadoResponse } from '../mensajes.responses';
import type { IArchivosService } from 'src/modules/archivos/application/archivos.service.interface';
import { IArchivoResponse } from 'src/modules/archivos/application/archivos.responses';
import type { IChatsService } from 'src/modules/chats/application/chats.service.interface';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import { EmisorEventos } from 'src/socket/emisor-eventos';

export interface ICrearArchivo {
  nombre?: string;
  tipoArchivo: TipoArchivo;
  b64: string;
}

@Injectable()
export class SendMensajePrivado {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject('IIntegranteRepository')
    private readonly integranteRepository: IIntegranteRepository,
    @Inject('IMensajeRepository')
    private readonly mensajeRepository: IMensajeRepository,
    @Inject('IViewerRepository')
    private readonly viewerRepository: IViewerRepository,
    @Inject('IDetalleMensajeRepository')
    private readonly detalleRepository: IDetalleMensajeRepository,
    @Inject('IArchivosService')
    private readonly archivosService: IArchivosService,
    @Inject('IChatsService')
    private readonly chatsService: IChatsService,
    @Inject()
    private readonly emisorEventos: EmisorEventos,
  ) {}

  async execute(
    usuario: IUsuario,
    id_usuarioB: string,
    descripcion?: string,
    archivos?: ICrearArchivo[],
  ): Promise<IRespuesta<IMensajePrivadoResponse>> {
    const id_usuarioA = usuario._id;
    if (!descripcion && !archivos) {
      return crearRespuesta({
        success: false,
        error: 'No se puede enviar un mensaje vacío.',
      });
    }

    if (id_usuarioA == id_usuarioB) {
      return crearRespuesta({
        success: false,
        error: 'No se puede enviar un mensaje a sí mismo.',
      });
    }

    const old_chat = await this.chatRepository.findChatPrivadoByIdUsuarios(
      id_usuarioA,
      id_usuarioB,
    );

    let id_chat: string = '';
    if (!old_chat) {
      const result = await this.chatsService.crearChatPrivado(
        usuario,
        id_usuarioB,
      );

      if (!result.success || !result.data) {
        return crearRespuesta({
          success: false,
          error: result.error,
        });
      }

      id_chat = result.data.id_chat;
    } else {
      id_chat = old_chat._id;
    }

    const integranteA = await this.integranteRepository.findOne({
      id_chat: id_chat,
      id_usuario: id_usuarioA,
      estado: Estado.HABILITADO,
    });

    if (!integranteA) {
      return crearRespuesta({
        success: false,
        error: 'El integrante no puede enviar mensajes.',
      });
    }

    const has_files = archivos ? true : false;
    const nuevo_mensaje = await this.mensajeRepository.create({
      id_integrante: integranteA._id,
      descripcion: descripcion,
      has_files: has_files,
    });

    const integrantes = await this.integranteRepository.findAll({
      id_chat: id_chat,
      estado: Estado.HABILITADO,
    });
    const integranteB = integrantes.find((i) => i.id_usuario != usuario._id);
    await this.viewerRepository.registrarViewers(nuevo_mensaje._id, [
      { id_integrante: integranteA._id, visto: true },
      { id_integrante: integranteB!._id, visto: false },
    ]);

    const detalles: IArchivoResponse[] = [];
    if (has_files) {
      for (const archivo of archivos!) {
        if (archivo.tipoArchivo == TipoArchivo.IMAGEN) {
          const rpta = await this.archivosService.saveImagen(
            archivo.b64,
            archivo.nombre,
          );
          if (rpta.data) {
            const archivo = rpta.data;
            detalles.push(archivo);
            await this.detalleRepository.create({
              id_mensaje: nuevo_mensaje._id,
              id_archivo: archivo.id_archivo,
            });
          }
        }
      }
    }

    const mensajeResponse: IMensajePrivadoResponse = {
      id_mensaje: nuevo_mensaje._id,
      id_usuario: id_usuarioA,
      id_usuarioB: id_usuarioB,
      id_chat: id_chat,
      is_group: false,
      descripcion: descripcion || null,
      has_files: has_files,
      createdAt: nuevo_mensaje.createdAt,
      archivos: detalles,
      estado: nuevo_mensaje.estado,
    };

    // emitir el eventop para que lo reciba el geateway
    this.emisorEventos.emit(TipoEvento.NUEVO_MENSAJE_PRIVADO, {
      idUsuarioA: id_usuarioA,
      idUsuarioB: id_usuarioB,
      mensaje: mensajeResponse,
    });

    return crearRespuesta({
      success: true,
      data: mensajeResponse,
    });
  }
}
