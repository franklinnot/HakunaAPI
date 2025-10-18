import { Injectable } from '@nestjs/common';
import { IChatsService } from './chats.service.interface';
import { IChatGrupalResponse, IChatPrivadoResponse } from './chats.responses';
import { CrearChatPrivado } from './use-cases/crear-chat-privado';
import { IRespuesta } from 'src/shared/application/response';
import { BuscarChatsPrivados } from './use-cases/get-chats-privados';
import { BuscarChatPrivado } from './use-cases/get-chat-privado';

@Injectable()
export class ChatsService implements IChatsService {
  constructor(
    private readonly crearChatPrivado: CrearChatPrivado,
    private readonly buscarChatsPrivados: BuscarChatsPrivados,
    private readonly buscarChatPrivado: BuscarChatPrivado,
  ) {}

  async createChatPrivado(
    id_usuarioA: string,
    id_usuarioB: string,
  ): Promise<IRespuesta<IChatPrivadoResponse>> {
    return await this.crearChatPrivado.execute(id_usuarioA, id_usuarioB);
  }

  createChatGrupal(
    foto: string,
    nombre: string,
    descripcion: string,
    id_usuarioAdmin: string,
    usarios: { id_usuario: string }[],
  ): Promise<IRespuesta<IChatPrivadoResponse>> {
    throw new Error('Method not implemented.');
  }

  async getChatsPrivados(
    id_usuario: string,
  ): Promise<IRespuesta<IChatPrivadoResponse[]>> {
    return await this.buscarChatsPrivados.execute(id_usuario);
  }

  async getChatPrivado(
    id_chat: string,
    id_usuario: string,
  ): Promise<IRespuesta<IChatPrivadoResponse>> {
    return await this.buscarChatPrivado.execute(id_chat, id_usuario);
  }

  getChatsGrupales(): Promise<IRespuesta<IChatGrupalResponse[]>> {
    throw new Error('Method not implemented.');
  }
}
