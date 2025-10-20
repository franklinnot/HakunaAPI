import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IChatGrupalResponse } from '../chats.responses';
import type { IChatRepository } from '../../infraestructure/chats.repositories.interfaces';
import { Estado } from 'src/shared/domain/enums';
import { MensajesUtils } from 'src/modules/mensajes/application/mensajes.utils';
import { IChat } from '../../domain/chats.entities';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';
import { ChatsUtils } from '../chats.utils';

@Injectable()
export class GetChatGrupal {
  constructor(
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
    @Inject()
    private readonly mensajesUtils: MensajesUtils,
    @Inject()
    private readonly chatsUtils: ChatsUtils,
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(
    id_chat: string,
    chat_existente?: IChat,
  ): Promise<IRespuesta<IChatGrupalResponse>> {
    let chat: IChat | null = null;
    if (!chat_existente) {
      chat = await this.chatRepository.findOne({
        _id: id_chat,
        estado: Estado.HABILITADO,
        is_group: true,
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

    const integrantesResponse =
      await this.chatsUtils.getIntegrantesResponseByChat(chat);

    // obtener ultimo mensaje
    const ultimo_mensaje = await this.mensajesUtils.getUltimoMensaje(id_chat);

    const link_foto = await this.archivoRepository.findLinkById(
      chat.id_foto || '',
    );

    // resultadop
    return crearRespuesta({
      success: true,
      data: {
        id_chat: chat._id,
        historial_mensajes: ultimo_mensaje ? [ultimo_mensaje] : [],
        ultimo_mensaje: ultimo_mensaje,
        createdAt: chat.createdAt,
        link_foto: link_foto,
        nombre: chat.nombre,
        descripcion: chat.descripcion,
        integrantes: integrantesResponse,
        cantidad_integrantes: chat.cantidad_integrantes,
      },
    });
  }
}
