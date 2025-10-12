/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from '../schemas/chat.schema';
import { BaseRepository } from 'src/shared/infraestructure/repository/base.repository';
import { Model } from 'mongoose';
import { IChat } from '../../domain/chats.entities';
import { Estado } from 'src/shared/domain/enums';
import { IChatRepository } from '../chats.repositories.interfaces';
import { Persistence } from '../../../../shared/infraestructure/infraestructure.types';

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
      _id: doc._id ?? '',
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
      estado: doc.estado ?? Estado.HABILITADO,
      //
      id_foto: doc.id_foto ?? null,
      nombre: doc.nombre ?? '',
      descripcion: doc.descripcion ?? '',
      is_group: doc.is_group ?? false,
      cantidad_integrantes: doc.cantidad_integrantes ?? 0,
    };
  }

  protected toPersistence(entity: Partial<IChat>): Persistence<IChat> {
    return {
      estado: entity.estado,
      id_foto: entity.id_foto,
      nombre: entity.nombre,
      descripcion: entity.descripcion,
      is_group: entity.is_group,
      cantidad_integrantes: entity.cantidad_integrantes,
    } as Persistence<IChat>;
  }

  // buscar chat privado entre ambos usuarios
  async findChatPrivadoByIdUsuarios(
    id_usuarioA: string,
    id_usuarioB: string,
  ): Promise<IChat | null> {
    const chat = await this.chatModel
      .findOne({
        is_group: false,
        estado: Estado.HABILITADO,
      })
      .populate({
        path: 'integrantes',
        match: {
          id_usuario: { $in: [id_usuarioA, id_usuarioB] },
          estado: Estado.HABILITADO,
        },
        select: 'id_usuario', // solo traemos lo necesario
      })
      .lean()
      .exec();

    // Validar que el chat tiene exactamente 2 integrantes (los dos usuarios buscados)
    if (
      !chat ||
      !(chat as any).integrantes ||
      (chat as any).integrantes.length != 2 ||
      !(chat as any).integrantes.some(
        (i: any) => i.id_usuario == id_usuarioA,
      ) ||
      !(chat as any).integrantes.some((i: any) => i.id_usuario == id_usuarioB)
    ) {
      return null;
    }

    return this.toDomain(chat);
  }

  // buscar chats privados de un usuario
  async findChatsPrivadosByIdUsuario(id_usuario: string): Promise<IChat[]> {
    const chats = await this.chatModel
      .find({
        is_group: false,
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

    // filtrar solo los chats que efectivamente tienen al usuario como integrante
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
