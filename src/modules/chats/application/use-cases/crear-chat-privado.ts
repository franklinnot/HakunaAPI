import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IChatPrivadoResponse } from '../chats.responses';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import type {
  IChatRepository,
  IIntegranteRepository,
} from '../../infraestructure/chats.repositories.interfaces';
import { Estado } from 'src/shared/domain/enums';
import { IChat } from '../../domain/chats.entities';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import { UsuariosUtils } from 'src/modules/usuarios/application/usuarios.utils';

@Injectable()
export class CrearChatPrivado {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject('IIntegranteRepository')
    private readonly integranteRepository: IIntegranteRepository,
    @Inject()
    private readonly usuariosUtils: UsuariosUtils,
  ) {}

  async execute(
    usuarioA: IUsuario,
    id_usuarioB: string,
  ): Promise<IRespuesta<IChatPrivadoResponse>> {
    const id_usuarioA = usuarioA._id;

    if (id_usuarioA == id_usuarioB) {
      return crearRespuesta({
        success: false,
        error: 'No se puede crear un chat privado con el mismo usuario.',
      });
    }

    const usuarioB = await this.usuarioRepository.findById(id_usuarioB);

    if (!usuarioB || usuarioB.estado == Estado.DESHABILITADO) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no existe.',
      });
    }

    const old_chat = await this.chatRepository.findChatPrivadoByIdUsuarios(
      id_usuarioA,
      id_usuarioB,
    );

    if (old_chat) {
      return crearRespuesta({
        success: false,
        error: 'Ya existe un chat privado con este usuario.',
      });
    }

    const new_chat = await this.chatRepository.create({
      is_group: false,
      cantidad_integrantes: 2,
    });

    return await this.returnChat(new_chat, usuarioA, usuarioB);
  }

  async returnChat(
    chat: IChat,
    usuarioA: IUsuario,
    usuarioB: IUsuario,
  ): Promise<IRespuesta<IChatPrivadoResponse>> {
    await this.integranteRepository.registerIntegrantes(chat._id, [
      { id_usuario: usuarioA._id, is_admin: false },
      { id_usuario: usuarioB._id, is_admin: false },
    ]);

    const usuarioBResponse =
      await this.usuariosUtils.getUsuarioResponse(usuarioB);

    return crearRespuesta({
      success: true,
      data: {
        id_chat: chat._id,
        historial_mensajes: [],
        createdAt: chat.createdAt,
        usuarioB: usuarioBResponse,
        ultimo_mensaje: null,
        is_group: false,
      },
    });
  }
}
