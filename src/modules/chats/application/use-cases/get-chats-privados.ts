import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IChatPrivadoResponse } from '../chats.responses';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import type {
  IChatRepository,
  IIntegranteRepository,
} from '../../infraestructure/chats.repositories.interfaces';
import { Estado } from 'src/shared/domain/enums';
import { UsuariosMapper } from 'src/modules/usuarios/application/usuarios.mapper';
import { IChat } from '../../domain/chats.entities';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import type { IMensajeRepository } from 'src/modules/mensajes/infraestructure/mensajes.repositories.interfaces';
import { IMensajeResponse } from 'src/modules/mensajes/application/mensajes.responses';
import { MensajesUtils } from 'src/modules/mensajes/application/mensajes.utils';
import { IArchivoResponse } from 'src/modules/archivos/application/archivos.responses';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';
import { IUsuarioResponse } from 'src/modules/usuarios/application/usuarios.responses';

@Injectable()
export class BuscarChatsPrivados {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject('IIntegranteRepository')
    private readonly integranteRepository: IIntegranteRepository,
    @Inject('IMensajeRepository')
    private readonly mensajeRepository: IMensajeRepository,
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
    private readonly mensajesUtils: MensajesUtils,
  ) {}

  async execute(
    id_usuario: string,
  ): Promise<IRespuesta<IChatPrivadoResponse[]>> {
    if (!id_usuario) {
      return crearRespuesta({
        success: false,
        error: 'Solicitud inválida.',
      });
    }

    const usuario = await this.usuarioRepository.findById(id_usuario);

    if (!usuario || usuario.estado == Estado.DESHABILITADO) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no existe.',
      });
    }

    const chats =
      await this.chatRepository.findChatsPrivadosByIdUsuario(id_usuario);

    const chatsResponse = await this.buildChatsPrivados(usuario, chats);

    return crearRespuesta({
      success: true,
      data: chatsResponse,
    });
  }

  async buildChatsPrivados(
    usuarioA: IUsuario,
    chats: IChat[],
  ): Promise<IChatPrivadoResponse[]> {
    const chatsResponse: IChatPrivadoResponse[] = [];

    for (const chat of chats) {
      const usuarioB = await this.getUsuarioB(chat._id, usuarioA._id);
      const ultimo_mensaje =
        await this.mensajeRepository.findUltimoMensajeByChatId(chat._id);

      const historial_mensajes: IMensajeResponse[] = [];

      if (ultimo_mensaje) {
        const has_files = ultimo_mensaje.has_files;
        let archivos: IArchivoResponse[] | null = [];
        if (has_files) {
          archivos = await this.mensajesUtils.obtenerDetalles(
            ultimo_mensaje._id,
          );
        }
        const emisor = await this.integranteRepository.findById(
          ultimo_mensaje.id_integrante,
        );
        const mensajeResponse = {
          id_mensaje: ultimo_mensaje._id,
          id_usuario: emisor!.id_usuario,
          id_chat: chat._id,
          es_grupal: chat.is_group,
          descripcion: ultimo_mensaje.descripcion,
          has_files: ultimo_mensaje.has_files,
          createdAt: ultimo_mensaje.createdAt,
          archivos: archivos,
          estado: ultimo_mensaje.estado,
        };
        historial_mensajes.push(mensajeResponse);
      }

      if (historial_mensajes.length == 0) continue;

      chatsResponse.push({
        id_chat: chat._id,
        historial_mensajes: historial_mensajes,
        createdAt: chat.createdAt,
        usuarioB: usuarioB,
      });
    }
    return chatsResponse;
  }

  async getUsuarioB(
    id_chat: string,
    id_usuarioA: string,
  ): Promise<IUsuarioResponse> {
    const integrantes =
      await this.integranteRepository.findAllByIdChat(id_chat);

    const integranteB = integrantes.find((i) => i.id_usuario != id_usuarioA);

    const usuarioB = await this.usuarioRepository.findById(
      integranteB!.id_usuario,
    );

    const link_foto = await this.archivoRepository.findLinkById(
      usuarioB!.id_foto || '',
    );

    return UsuariosMapper.toUsuarioResponse(usuarioB!, link_foto);
  }
}
