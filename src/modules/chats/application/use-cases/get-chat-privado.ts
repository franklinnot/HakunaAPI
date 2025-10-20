import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IChatPrivadoResponse } from '../chats.responses';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import type {
  IChatRepository,
  IIntegranteRepository,
} from '../../infraestructure/chats.repositories.interfaces';
import { Estado } from 'src/shared/domain/enums';
import { IUsuarioResponse } from 'src/modules/usuarios/application/usuarios.responses';
import { UsuariosUtils } from 'src/modules/usuarios/application/usuarios.utils';
import { MensajesUtils } from 'src/modules/mensajes/application/mensajes.utils';
import { IChat } from '../../domain/chats.entities';

@Injectable()
export class GetChatPrivado {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IUsuarioRepository')
    private readonly integranteRepository: IIntegranteRepository,
    @Inject()
    private readonly usuariosUtils: UsuariosUtils,
    @Inject()
    private readonly mensajesUtils: MensajesUtils,
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(
    id_usuario: string,
    id_chat: string,
    chat_existente?: IChat,
  ): Promise<IRespuesta<IChatPrivadoResponse>> {
    let chat: IChat | null = null;
    if (!chat_existente) {
      chat = await this.chatRepository.findOne({
        _id: id_chat,
        estado: Estado.HABILITADO,
        is_group: false,
        cantidad_integrantes: 2,
      });
      if (!chat) {
        return crearRespuesta({
          success: false,
          error: 'El chat no existe.',
        });
      }
    } else {
      chat = chat_existente;
    }

    // obtener el otro integrante
    const usuarioB = await this.getUsuarioB(id_usuario, chat._id);

    // obtener ultimo mensaje
    const ultimo_mensaje = await this.mensajesUtils.getUltimoMensaje(id_chat);

    // resultadop
    return crearRespuesta({
      success: true,
      data: {
        id_chat: chat._id,
        historial_mensajes: ultimo_mensaje ? [ultimo_mensaje] : [],
        createdAt: chat.createdAt,
        usuarioB: usuarioB,
        ultimo_mensaje: ultimo_mensaje,
      },
    });
  }

  async getUsuarioB(
    id_usuario: string,
    id_chat: string,
  ): Promise<IUsuarioResponse> {
    const integrantes = await this.integranteRepository.findAll({
      id_chat: id_chat,
      estado: Estado.HABILITADO,
    });

    const integranteB = integrantes.find((i) => i.id_usuario != id_usuario);

    const usuarioB = await this.usuarioRepository.findById(
      integranteB!.id_usuario,
    );

    return this.usuariosUtils.getUsuarioResponse(usuarioB!);
  }
}
