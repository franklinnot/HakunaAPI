import { IBaseRepository } from 'src/shared/infraestructure/repository/base.repository.interface';
import { IChat, IIntegrante } from '../domain/chats.entities';

export interface IChatRepository extends IBaseRepository<IChat> {
  findChatPrivadoByIdUsuarios(
    id_usuarioA: string,
    id_usuarioB: string,
  ): Promise<IChat | null>;
  findChatsPrivadosByIdUsuario(id_usuario: string): Promise<IChat[]>;
  findChatsGrupalesByIdUsuario(id_usuario: string): Promise<IChat[]>;
  deleteGroup(id_chat: string): Promise<void>;
}

export interface IIntegranteRepository extends IBaseRepository<IIntegrante> {
  registerIntegrantes(
    id_chat: string,
    integrantes: { id_usuario: string; is_admin: boolean }[],
  ): Promise<IIntegrante[]>;
}
