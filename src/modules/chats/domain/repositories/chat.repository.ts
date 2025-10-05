import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Chat } from "../schemas/chat.schema";
import { BaseRepository } from "src/shared/domain/persistence/base.repository";
import { Model, Types } from "mongoose";
import { Integrante } from "src/modules/chats/domain/schemas/integrante.schema";
import { Usuario } from "src/modules/usuarios/domain/schemas/usuario.schema";

@Injectable()
export class ChatRepository extends BaseRepository<Chat> {
  constructor(
    @InjectModel(Chat.name)
    private readonly chatModel: Model<Chat>,
  ) {
    super(chatModel);
  }

  /* 1️ Buscar chat por su ID (abrirlo) */
  async findById(chatId: string): Promise<Chat | null> {
    return this.chatModel.findById(chatId).exec();
  }

  /* 2️ Listar todos los chats de un usuario (vista principal tipo WhatsApp) */
  async findAllByUser(
    userId: string,
    integranteModel: Model<Integrante>,
  ): Promise<Chat[]> {
    const integraciones = await integranteModel
      .find({ id_usuario: userId, estado: "HABILITADO" })
      .select("id_chat")
      .exec();

    const chatIds = integraciones.map((i) => new Types.ObjectId(i.id_chat));

    return this.chatModel
      .find({ _id: { $in: chatIds }, estado: "HABILITADO" })
      .exec();
  }

  /* 3 Buscar chat privado entre dos usuarios (para abrir o evitar duplicar) */
  async findPrivateChatBetweenUsers(
    userAId: string,
    userBId: string,
    integranteModel: Model<Integrante>,
  ): Promise<Chat | null> {
    const [chatsUserA, chatsUserB] = await Promise.all([
      integranteModel.find({ id_usuario: userAId }).select("id_chat").exec(),
      integranteModel.find({ id_usuario: userBId }).select("id_chat").exec(),
    ]);

    const chatIdsA = chatsUserA.map((i) => i.id_chat.toString());
    const chatIdsB = chatsUserB.map((i) => i.id_chat.toString());

    const commonChatId = chatIdsA.find((id) => chatIdsB.includes(id));
    if (!commonChatId) return null;

    return this.chatModel
      .findOne({ _id: commonChatId, is_group: false, estado: "HABILITADO" })
      .exec();
  }

  /* 4️ Buscar chats por nombre (grupos o usuarios) */
  async searchChatsByName(
    searchTerm: string,
    integranteModel: Model<Integrante>,
    userModel: Model<Usuario>,
    userId: string,
  ): Promise<Chat[]> {
    // 4.1️ Obtener IDs de chats donde participa el usuario
    const integraciones = await integranteModel
      .find({ id_usuario: userId })
      .select("id_chat")
      .exec();

    const chatIds = integraciones.map((i) => i.id_chat);

    // 4.2 Buscar grupos que coincidan con el nombre
    const groupChats = await this.chatModel
      .find({
        _id: { $in: chatIds },
        is_group: true,
        nombre: { $regex: searchTerm, $options: "i" },
        estado: "HABILITADO",
      })
      .exec();

    // 4.3 Buscar usuarios cuyo nombre coincida
    const userMatches = await userModel
      .find({ nombre: { $regex: searchTerm, $options: "i" } })
      .select("_id")
      .exec();

    const userIds = userMatches.map((u) => String(u._id));

    // 4.4 Buscar chats privados donde esté el otro usuario
    const userIntegraciones = await integranteModel
      .find({
        id_usuario: { $in: userIds },
        id_chat: { $in: chatIds },
      })
      .select("id_chat")
      .exec();

    const privateChatIds = userIntegraciones.map((i) => i.id_chat);

    const privateChats = await this.chatModel
      .find({
        _id: { $in: privateChatIds },
        is_group: false,
        estado: "HABILITADO",
      })
      .exec();

    // 5️ Unir ambos resultados sin duplicar
    const allChatsMap = new Map<string, Chat>();
    [...groupChats, ...privateChats].forEach((chat) =>
      allChatsMap.set(String(chat._id), chat),
    );

    return Array.from(allChatsMap.values());
  }

  /* 6  Crear nuevo chat */
  async createChat(chat: Chat): Promise<Chat> {
    return this.chatModel.create(chat);
  }
}