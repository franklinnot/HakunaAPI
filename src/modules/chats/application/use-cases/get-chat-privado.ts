import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IChatPrivadoResponse } from '../chats.responses';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import type { IChatRepository } from '../../infraestructure/chats.repositories.interfaces';
import { Estado } from 'src/shared/domain/enums';
import { GetMensajesPrivados } from 'src/modules/mensajes/application/use-cases/get-mensajes-privados';
import { ChatsUtils } from '../chats.utils';

@Injectable()
export class BuscarChatPrivado {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    private readonly getMensajesPrivadosService: GetMensajesPrivados,
    private readonly chatsUtils: ChatsUtils,
  ) {}

  async execute(
    id_chat: string,
    id_usuarioA: string,
  ): Promise<IRespuesta<IChatPrivadoResponse>> {
    const chat = await this.chatRepository.findById(id_chat);
    const usuarioA = await this.usuarioRepository.findById(id_usuarioA);

    if (!chat || chat.estado == Estado.DESHABILITADO) {
      return crearRespuesta({
        success: false,
        error: 'El chat no existe.',
      });
    }

    if (!usuarioA || usuarioA.estado == Estado.DESHABILITADO) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no existe.',
      });
    }

    // obtener el otro integrante
    const usuarioB = await this.chatsUtils.getUsuarioB(chat._id, usuarioA._id);

    // obtener historial completo de mensajes
    const mensajesResult = await this.getMensajesPrivadosService.execute(
      id_usuarioA,
      id_chat,
    );

    const historial_mensajes = mensajesResult.success
      ? mensajesResult.data!
      : [];

    // ultimo mensaje (si existe)
    const ultimo_mensaje = historial_mensajes.length
      ? historial_mensajes[historial_mensajes.length - 1]
      : undefined;

    // resultadop
    return crearRespuesta({
      success: true,
      data: {
        id_chat: chat._id,
        historial_mensajes,
        createdAt: chat.createdAt,
        usuarioB,
        ultimo_mensaje,
      },
    });
  }
}
