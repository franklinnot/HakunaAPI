import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import {
  IChatPrivadoResponse,
  IIntegrantePrivadoResponse,
} from '../chats.responses';
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
      const [id_integranteA, integranteB] = await this.returnIntegrantesByChat(
        chat._id,
        usuarioA,
      );
      const ultimo_mensaje =
        await this.mensajeRepository.findUltimoMensajeByChatId(chat._id);

      const historial_mensajes: IMensajeResponse[] = [];

      if (ultimo_mensaje != null) {
        const has_files = ultimo_mensaje.has_files;
        let archivos: IArchivoResponse[] | null = [];
        if (has_files) {
          archivos = await this.mensajesUtils.obtenerDetalles(
            ultimo_mensaje._id,
          );
        }
        const mensajeResponse = {
          id_mensaje: ultimo_mensaje._id,
          id_integrante: ultimo_mensaje.id_integrante,
          descripcion: ultimo_mensaje.descripcion,
          has_files: ultimo_mensaje.has_files,
          createdAt: ultimo_mensaje.createdAt,
          archivos: archivos,
          estado: ultimo_mensaje.estado,
        };
        historial_mensajes.push(mensajeResponse);
      }
      chatsResponse.push({
        id_chat: chat._id,
        historial_mensajes: historial_mensajes,
        createdAt: chat.createdAt,
        id_integranteA: id_integranteA,
        integranteB: integranteB,
      });
    }
    return chatsResponse;
  }

  async returnIntegrantesByChat(
    id_chat: string,
    usuarioA: IUsuario,
  ): Promise<
    [id_integranteA: string, integranteB: IIntegrantePrivadoResponse]
  > {
    const integrantes =
      await this.integranteRepository.findAllByIdChat(id_chat);

    const id_integranteA = integrantes.find(
      (i) => i.id_usuario == usuarioA._id,
    )?._id;

    const segundoIntegrante = integrantes.find(
      (i) => i.id_usuario != usuarioA._id,
    );

    const usuarioB = await this.usuarioRepository.findById(
      segundoIntegrante?.id_usuario ?? '',
    );

    const integranteB: IIntegrantePrivadoResponse = {
      id_integrante: segundoIntegrante?._id ?? '',
      ...UsuariosMapper.toUsuarioResponse(usuarioB!),
    };

    return [id_integranteA!, integranteB];
  }
}
