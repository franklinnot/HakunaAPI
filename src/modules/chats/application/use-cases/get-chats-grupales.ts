import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IChatGrupalResponse } from '../chats.responses';
import type { IChatRepository } from '../../infraestructure/chats.repositories.interfaces';
import { GetChatGrupal } from './get-chat-grupal';

@Injectable()
export class GetChatsGrupales {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject()
    private readonly getChatGrupalCU: GetChatGrupal,
  ) {}

  async execute(
    id_usuario: string,
  ): Promise<IRespuesta<IChatGrupalResponse[]>> {
    const chats =
      await this.chatRepository.findChatsGrupalesByIdUsuario(id_usuario);

    const chatsResponse: IChatGrupalResponse[] = [];

    for (const c of chats) {
      const chatResult = await this.getChatGrupalCU.execute(c._id, id_usuario, c);

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
