import { Inject, Injectable } from '@nestjs/common';
import { IChatsService } from './chats.service.interface';
import { IChatGrupalResponse, IChatPrivadoResponse } from './chats.responses';
import { CrearChatPrivado } from './use-cases/crear-chat-privado';
import { IRespuesta } from 'src/shared/application/response';
import { GetChatsPrivados } from './use-cases/get-chats-privados';
import { GetChatPrivado } from './use-cases/get-chat-privado';
import { CrearChatGrupal } from './use-cases/crear-chat-grupal';
import { GetChatsGrupales } from './use-cases/get-chats-grupales';
import { UpdateChatGrupal } from './use-cases/update-chat-grupal/update-chat-grupal';
import { AddMemberToGroup } from './use-cases/add-member-to-group';
import { RemoveMemberFromGroup } from './use-cases/remove-member-from-group';
import { GetChatGrupal } from './use-cases/get-chat-grupal';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';

@Injectable()
export class ChatsService implements IChatsService {
  constructor(
    @Inject()
    private readonly crearChatPrivadoCU: CrearChatPrivado,
    @Inject()
    private readonly crearChatGrupalCU: CrearChatGrupal,
    @Inject()
    private readonly getChatPrivadoCU: GetChatPrivado,
    @Inject()
    private readonly getChatsPrivadosCU: GetChatsPrivados,
    @Inject()
    private readonly getChatsGrupalesCU: GetChatsGrupales,
    @Inject()
    private readonly updateChatGrupalCU: UpdateChatGrupal,
    @Inject()
    private readonly addMemberToGroupCU: AddMemberToGroup,
    @Inject()
    private readonly removeMemberFromGroupCU: RemoveMemberFromGroup,
    @Inject()
    private readonly getChatGrupalCU: GetChatGrupal,
  ) {}

  async crearChatPrivado(
    usuario: IUsuario,
    id_usuarioB: string,
  ): Promise<IRespuesta<IChatPrivadoResponse>> {
    return await this.crearChatPrivadoCU.execute(usuario, id_usuarioB);
  }

  async crearChatGrupal(
    usuario: IUsuario,
    usuarios: { id_usuario: string }[],
    nombre: string,
    descripcion?: string,
    foto?: string,
  ): Promise<IRespuesta<IChatGrupalResponse>> {
    return await this.crearChatGrupalCU.execute(
      usuario,
      usuarios,
      nombre,
      descripcion,
      foto,
    );
  }

  async getChatsPrivados(
    id_usuario: string,
  ): Promise<IRespuesta<IChatPrivadoResponse[]>> {
    return await this.getChatsPrivadosCU.execute(id_usuario);
  }

  async getChatPrivado(
    id_usuario: string,
    id_chat: string,
  ): Promise<IRespuesta<IChatPrivadoResponse>> {
    return await this.getChatPrivadoCU.execute(id_usuario, id_chat);
  }

  async getChatsGrupales(
    id_usuario: string,
  ): Promise<IRespuesta<IChatGrupalResponse[]>> {
    return await this.getChatsGrupalesCU.execute(id_usuario);
  }

  async getChatGrupal(
    id_chat: string,
  ): Promise<IRespuesta<IChatGrupalResponse>> {
    return await this.getChatGrupalCU.execute(id_chat);
  }

  async updateChatGrupal(
    id_usuario: string,
    id_chat: string,
    nombre?: string,
    descripcion?: string,
    foto?: string | null,
  ): Promise<IRespuesta<IChatGrupalResponse>> {
    return await this.updateChatGrupalCU.execute(
      id_usuario,
      id_chat,
      nombre,
      descripcion,
      foto,
    );
  }

  async addMemberToGroup(
    id_usuario: string,
    id_chat: string,
    id_nuevo_miembro: string,
  ): Promise<IRespuesta<IChatGrupalResponse>> {
    return await this.addMemberToGroupCU.execute(
      id_usuario,
      id_chat,
      id_nuevo_miembro,
    );
  }

  async removeMemberFromGroup(
    id_usuario: string,
    id_chat: string,
    id_miembro_a_eliminar: string,
  ): Promise<IRespuesta<IChatGrupalResponse>> {
    return await this.removeMemberFromGroupCU.execute(
      id_usuario,
      id_chat,
      id_miembro_a_eliminar,
    );
  }
}
