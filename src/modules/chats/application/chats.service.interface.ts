import { IRespuesta } from 'src/shared/application/response';
import { IChatGrupalResponse, IChatPrivadoResponse } from './chats.responses';

export interface IChatsService {
  createChatPrivado(
    id_usuarioA: string,
    id_usuarioB: string,
  ): Promise<IRespuesta<IChatPrivadoResponse>>;
  createChatGrupal(
    foto: string | null,
    nombre: string,
    descripcion: string,
    id_usuarioAdmin: string,
    usarios: { id_usuario: string }[],
  ): Promise<IRespuesta<IChatGrupalResponse>>;
  getChatsGrupales(id_usuario: string): Promise<IRespuesta<IChatGrupalResponse[]>>;
  getChatsPrivados(
    id_usuario: string,
  ): Promise<IRespuesta<IChatPrivadoResponse[]>>;
  getChatPrivado(
    id_chat: string,
    id_usuario: string,
  ): Promise<IRespuesta<IChatPrivadoResponse>>;
  updateChatGrupal(
    id_chat: string,
    id_usuario: string,
    foto?: string | null,
    nombre?: string,
    descripcion?: string,
  ): Promise<IRespuesta<IChatGrupalResponse>>;
}
