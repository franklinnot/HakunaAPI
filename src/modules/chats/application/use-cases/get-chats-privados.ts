import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IChatPrivadoResponse } from '../chats.responses';
import type { IChatRepository } from '../../infraestructure/chats.repositories.interfaces';
import { GetChatPrivado } from './get-chat-privado';

@Injectable()
export class GetChatsPrivados {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject()
    private readonly getChatPrivadoCU: GetChatPrivado,
  ) {}

  async execute(
    id_usuario: string,
  ): Promise<IRespuesta<IChatPrivadoResponse[]>> {
    const chats =
      await this.chatRepository.findChatsPrivadosByIdUsuario(id_usuario);

    const chatsResponse: IChatPrivadoResponse[] = [];

    for (const chat of chats) {
      const chatResult = await this.getChatPrivadoCU.execute(
        chat._id,
        id_usuario,
        chat,
      );

      if (chatResult.success && chatResult.data) {
        chatsResponse.push(chatResult.data);
      }
    }

    // por fecha del ultimo mensaje
    chatsResponse.sort((a, b) => {
      const fechaA = a.ultimo_mensaje?.createdAt.getTime() || 0;
      const fechaB = b.ultimo_mensaje?.createdAt.getTime() || 0;
      return fechaB - fechaA;
    });

    return crearRespuesta({
      success: true,
      data: chatsResponse,
    });
  }
}
