import { IRespuesta } from 'src/shared/application/response';
import { IChatGrupalResponse, IChatPrivadoResponse } from './chats.responses';

export interface IChatsService {
  createChatPrivado(
    id_usuarioA: string,
    id_usuarioB: string,
  ): Promise<IRespuesta<IChatPrivadoResponse>>;
  createChatGrupal(
    foto: string,
    nombre: string,
    descripcion: string,
    id_usuarioAdmin: string,
    usarios: { id_usuario: string }[],
  ): Promise<IRespuesta<IChatPrivadoResponse>>;
  getChatsGrupales(): Promise<IRespuesta<IChatGrupalResponse[]>>;
  getChatsPrivados(
    id_usuario: string,
  ): Promise<IRespuesta<IChatPrivadoResponse[]>>;
}
