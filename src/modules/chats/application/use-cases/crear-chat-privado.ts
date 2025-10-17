import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IChatPrivadoResponse } from '../chats.responses';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import type { IChatRepository } from '../../infraestructure/chats.repositories.interfaces';
import { Estado } from 'src/shared/domain/enums';
import { ChatsUtils } from '../chats.utils';

@Injectable()
export class CrearChatPrivado {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    private readonly chatsUtils: ChatsUtils,
  ) {}

  async execute(
    id_usuarioA: string,
    id_usuarioB: string,
  ): Promise<IRespuesta<IChatPrivadoResponse>> {
    if (id_usuarioA == id_usuarioB || !id_usuarioA || !id_usuarioB) {
      return crearRespuesta({
        success: false,
        error: 'Solicitud inválida.',
      });
    }

    const usuarioA = await this.usuarioRepository.findById(id_usuarioA);
    const usuarioB = await this.usuarioRepository.findById(id_usuarioB);

    if (
      !usuarioA ||
      !usuarioB ||
      usuarioA.estado == Estado.DESHABILITADO ||
      usuarioB.estado == Estado.DESHABILITADO
    ) {
      return crearRespuesta({
        success: false,
        error: 'Solicitud inválida.',
      });
    }

    const old_chat = await this.chatRepository.findChatPrivadoByIdUsuarios(
      id_usuarioA,
      id_usuarioB,
    );

    if (old_chat) {
      return crearRespuesta({
        success: false,
        error: 'El chat ya existe.',
      });
    }

    const new_chat = await this.chatRepository.create({
      is_group: false,
      cantidad_integrantes: 2,
    });

    return await this.chatsUtils.returnChat(new_chat, usuarioA, usuarioB);
  }
}
