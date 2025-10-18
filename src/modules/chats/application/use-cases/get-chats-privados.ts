import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IChatPrivadoResponse } from '../chats.responses';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import type { IChatRepository } from '../../infraestructure/chats.repositories.interfaces';
import { Estado } from 'src/shared/domain/enums';
import { BuscarChatPrivado } from './get-chat-privado';

@Injectable()
export class BuscarChatsPrivados {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    private readonly buscarChatPrivadoService: BuscarChatPrivado,
  ) {}

  async execute(
    id_usuario: string,
  ): Promise<IRespuesta<IChatPrivadoResponse[]>> {
    const usuario = await this.usuarioRepository.findById(id_usuario);

    if (!usuario || usuario.estado == Estado.DESHABILITADO) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no existe o está deshabilitado.',
      });
    }

    const chats =
      await this.chatRepository.findChatsPrivadosByIdUsuario(id_usuario);

    const chatsResponse: IChatPrivadoResponse[] = [];

    for (const chat of chats) {
      const chatResult = await this.buscarChatPrivadoService.execute(
        chat._id,
        id_usuario,
      );

      if (chatResult.success && chatResult.data) {
        chatsResponse.push(chatResult.data);
      }
    }

    // por fecha del ultimo mensaje
    chatsResponse.sort((a, b) => {
      const fechaA = a.ultimo_mensaje
        ? new Date(a.ultimo_mensaje.createdAt).getTime()
        : 0;
      const fechaB = b.ultimo_mensaje
        ? new Date(b.ultimo_mensaje.createdAt).getTime()
        : 0;
      return fechaB - fechaA;
    });

    return crearRespuesta({
      success: true,
      data: chatsResponse,
    });
  }
}
