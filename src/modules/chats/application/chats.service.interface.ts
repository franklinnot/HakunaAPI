import { IRespuesta } from 'src/shared/application/response';
import { IChatGrupalResponse, IChatPrivadoResponse } from './chats.responses';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';

export interface IChatsService {
  crearChatPrivado(
    usuario: IUsuario,
    id_usuarioB: string,
  ): Promise<IRespuesta<IChatPrivadoResponse>>;
  crearChatGrupal(
    usuario: IUsuario,
    usuarios: { id_usuario: string }[],
    nombre: string,
    descripcion?: string,
    foto?: string,
  ): Promise<IRespuesta<IChatGrupalResponse>>;
  getChatsGrupales(
    id_usuario: string,
  ): Promise<IRespuesta<IChatGrupalResponse[]>>;
  getChatsPrivados(
    id_usuario: string,
  ): Promise<IRespuesta<IChatPrivadoResponse[]>>;
  getChatPrivado(
    id_usuario: string,
    id_chat: string,
  ): Promise<IRespuesta<IChatPrivadoResponse>>;
  getChatGrupal(
    id_chat: string,
    id_usuario: string,
  ): Promise<IRespuesta<IChatGrupalResponse>>;
  updateChatGrupal(
    id_usuario: string,
    id_chat: string,
    nombre?: string,
    descripcion?: string,
    foto?: string | null,
  ): Promise<IRespuesta<IChatGrupalResponse>>;
  addMemberToGroup(
    id_usuario: string,
    id_chat: string,
    id_nuevo_miembro: string,
  ): Promise<IRespuesta<IChatGrupalResponse>>;
  removeMemberFromGroup(
    id_usuario: string,
    id_chat: string,
    id_miembro_a_eliminar: string,
  ): Promise<IRespuesta<IChatGrupalResponse>>;
  deleteGroup(id_usuario: string, id_chat: string): Promise<IRespuesta<any>>;
}
