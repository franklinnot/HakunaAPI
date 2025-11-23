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
import { IMensajeGrupalResponse } from '../mensajes.responses';
import type { IArchivosService } from 'src/modules/archivos/application/archivos.service.interface';
import { IArchivoResponse } from 'src/modules/archivos/application/archivos.responses';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import { EmisorEventos } from 'src/socket/emisor-eventos';
import { ICrearArchivo } from './send-mensaje-privado';

@Injectable()
export class SendMensajeGrupal {
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
    @Inject()
    private readonly emisorEventos: EmisorEventos,
  ) {}

  async execute(
    usuario: IUsuario,
    id_chat: string,
    descripcion?: string,
    archivos?: ICrearArchivo[],
  ): Promise<IRespuesta<IMensajeGrupalResponse>> {
    const id_usuario = usuario._id;

    if (!descripcion && !archivos) {
      return crearRespuesta({
        success: false,
        error: 'No se puede enviar un mensaje vacío.',
      });
    }

    // Verificar que el chat existe y es grupal
    const chat = await this.chatRepository.findById(id_chat);
    if (!chat) {
      return crearRespuesta({
        success: false,
        error: 'El chat no existe.',
      });
    }

    if (!chat.is_group) {
      return crearRespuesta({
        success: false,
        error: 'El chat no es grupal.',
      });
    }

    // Verificar que el usuario es integrante del grupo
    const integrante = await this.integranteRepository.findOne({
      id_chat: id_chat,
      id_usuario: id_usuario,
      estado: Estado.HABILITADO,
    });

    if (!integrante) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no es integrante del grupo o no está habilitado.',
      });
    }

    // Crear el mensaje
    const has_files = archivos ? true : false;
    const nuevo_mensaje = await this.mensajeRepository.create({
      id_integrante: integrante._id,
      descripcion: descripcion,
      has_files: has_files,
    });

    // Obtener todos los integrantes del grupo
    const integrantes = await this.integranteRepository.findAll({
      id_chat: id_chat,
      estado: Estado.HABILITADO,
    });

    // Registrar viewers para todos los integrantes
    const viewersData = integrantes.map((i) => ({
      id_integrante: i._id,
      visto: i._id === integrante._id, // Solo el emisor lo ha visto
    }));

    await this.viewerRepository.registrarViewers(
      nuevo_mensaje._id,
      viewersData,
    );

    // Procesar archivos si existen
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
        } else if (archivo.tipoArchivo == TipoArchivo.DOCUMENTO) {
          const rpta = await this.archivosService.saveDocumento(archivo.b64);
          if (rpta.data) {
            const archivo = rpta.data;
            detalles.push(archivo);
            await this.detalleRepository.create({
              id_mensaje: nuevo_mensaje._id,
              id_archivo: archivo.id_archivo,
            });
          }
        } else if (archivo.tipoArchivo == TipoArchivo.AUDIO) {
          const rpta = await this.archivosService.saveAudio(
            archivo.b64,
            archivo.nombre,
          );

          if (rpta?.data) {
            const archivo = rpta.data;
            detalles.push(archivo);
            await this.detalleRepository.create({
              id_mensaje: nuevo_mensaje._id,
              id_archivo: archivo.id_archivo,
            });
          }
        }
      }

      // si no se registró ningún archivo y tampoco hay descripción
      if (detalles.length === 0 && !descripcion) {
        return crearRespuesta({
          success: false,
          error:
            'No se pudo registrar ningún archivo ni se proporcionó descripción.',
        });
      }
    }

    // Crear respuesta
    const mensajeResponse: IMensajeGrupalResponse = {
      id_mensaje: nuevo_mensaje._id,
      id_usuario: id_usuario,
      id_chat: id_chat,
      is_group: true,
      descripcion: descripcion || null,
      has_files: has_files,
      createdAt: nuevo_mensaje.createdAt,
      archivos: detalles,
      estado: nuevo_mensaje.estado,
    };

    // Emitir evento para que lo reciba el gateway
    this.emisorEventos.emit(TipoEvento.NUEVO_MENSAJE_GRUPAL, {
      idChat: id_chat,
      mensaje: mensajeResponse,
    });

    return crearRespuesta({
      success: true,
      data: mensajeResponse,
    });
  }
}
