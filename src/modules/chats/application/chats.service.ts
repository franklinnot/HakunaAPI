import { Injectable } from '@nestjs/common';
import { IChatsService } from './chats.service.interface';
import { IChatGrupalResponse, IChatPrivadoResponse } from './chats.responses';
import { CrearChatPrivado } from './use-cases/crear-chat-privado';
import { IRespuesta } from 'src/shared/application/response';
import { BuscarChatsPrivados } from './use-cases/get-chats-privados';
import { BuscarChatPrivado } from './use-cases/get-chat-privado';
import { CrearChatGrupalUseCase } from './use-cases/crear-chat-grupal';
import { BuscarChatsGrupales } from './use-cases/get-chats-grupales';
import { ActualizarChatGrupalUseCase } from './use-cases/actualizar-chat-grupal';

@Injectable()
export class ChatsService implements IChatsService {
  constructor(
    private readonly crearChatPrivado: CrearChatPrivado,
    private readonly buscarChatsPrivados: BuscarChatsPrivados,
    private readonly buscarChatPrivado: BuscarChatPrivado,
    private readonly crearChatGrupal: CrearChatGrupalUseCase,
    private readonly buscarChatsGrupales: BuscarChatsGrupales,
    private readonly actualizarChatGrupal: ActualizarChatGrupalUseCase,
  ) {}

  async createChatPrivado(
    id_usuarioA: string,
    id_usuarioB: string,
  ): Promise<IRespuesta<IChatPrivadoResponse>> {
    return await this.crearChatPrivado.execute(id_usuarioA, id_usuarioB);
  }

  async createChatGrupal(
    foto: string | null,
    nombre: string,
    descripcion: string,
    id_usuarioAdmin: string,
    usarios: { id_usuario: string }[],
  ): Promise<IRespuesta<IChatGrupalResponse>> {
    return await this.crearChatGrupal.execute(
      foto,
      nombre,
      descripcion,
      id_usuarioAdmin,
      usarios,
    );
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

  async getChatsGrupales(id_usuario: string): Promise<IRespuesta<IChatGrupalResponse[]>> {
    return await this.buscarChatsGrupales.execute(id_usuario);
  }

  async updateChatGrupal(
    id_chat: string,
    id_usuario: string,
    foto?: string | null,
    nombre?: string,
    descripcion?: string,
  ): Promise<IRespuesta<IChatGrupalResponse>> {
    return await this.actualizarChatGrupal.execute(
      id_chat,
      id_usuario,
      foto,
      nombre,
      descripcion,
    );
  }
}
