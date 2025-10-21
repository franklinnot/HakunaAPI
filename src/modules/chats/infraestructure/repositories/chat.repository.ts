import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from '../schemas/chat.schema';
import { BaseRepository } from 'src/shared/infraestructure/repository/base.repository';
import { Model } from 'mongoose';
import { IChat } from '../../domain/chats.entities';
import { Estado } from 'src/shared/domain/enums';
import { IChatRepository } from '../chats.repositories.interfaces';

@Injectable()
export class ChatRepository
  extends BaseRepository<IChat, Chat>
  implements IChatRepository
{
  constructor(
    @InjectModel(Chat.name)
    private readonly chatModel: Model<Chat>,
  ) {
    super(chatModel);
  }

  protected toDomain(doc: Chat): IChat {
    return {
      _id: doc._id || '',
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
      estado: doc.estado || Estado.HABILITADO,
      //
      id_foto: doc.id_foto || null,
      nombre: doc.nombre || '',
      descripcion: doc.descripcion || '',
      is_group: doc.is_group || false,
      cantidad_integrantes: doc.cantidad_integrantes || 0,
    };
  }

  // buscar chat privado entre ambos usuarios
  async findChatPrivadoByIdUsuarios(
    id_usuarioA: string,
    id_usuarioB: string,
  ): Promise<IChat | null> {
    const chats = await this.chatModel
      .aggregate([
        {
          $match: {
            is_group: false,
            estado: Estado.HABILITADO,
            cantidad_integrantes: 2,
          },
        },
        {
          $lookup: {
            from: 'integrante',
            localField: '_id',
            foreignField: 'id_chat',
            as: 'integrantes',
          },
        },
        {
          $match: {
            'integrantes.estado': Estado.HABILITADO,
            'integrantes.id_usuario': { $all: [id_usuarioA, id_usuarioB] },
            'integrantes.2': { $exists: false }, // asegura que solo hay 2 integrantes
          },
        },
        {
          $limit: 1,
        },
      ])
      .exec();

    if (!chats || chats.length === 0) {
      return null;
    }

    return this.toDomain(chats[0] as Chat);
  }

  // buscar chats privados de un usuario
  async findChatsPrivadosByIdUsuario(id_usuario: string): Promise<IChat[]> {
    const chats = await this.chatModel
      .find({
        is_group: false,
        estado: Estado.HABILITADO,
        cantidad_integrantes: 2,
      })
      .populate({
        path: 'integrantes',
        match: {
          id_usuario: id_usuario,
          estado: Estado.HABILITADO,
        },
        select: '_id',
      })
      .lean()
      .exec();

    // filtrar solo los chats validos
    const chatsDelUsuario = chats.filter(
      (chat) =>
        Array.isArray((chat as any).integrantes) &&
        (chat as any).integrantes.length > 0,
    );

    return chatsDelUsuario.map((chat) => this.toDomain(chat));
  }

  // buscar chats grupales de un usuario
  async findChatsGrupalesByIdUsuario(id_usuario: string): Promise<IChat[]> {
    const chats = await this.chatModel
      .find({
        is_group: true,
        estado: Estado.HABILITADO,
      })
      .populate({
        path: 'integrantes',
        match: {
          id_usuario: id_usuario,
          estado: Estado.HABILITADO,
        },
        select: '_id',
      })
      .lean()
      .exec();

    // filtrar solo los chats validos
    const chatsDelUsuario = chats.filter(
      (chat) =>
        Array.isArray((chat as any).integrantes) &&
        (chat as any).integrantes.length > 0,
    );

    return chatsDelUsuario.map((chat) => this.toDomain(chat));
  }

  // buscar coincidencias
  // async searchChatsByName(searchTerm: string): Promise<Chat[]> {}
}
