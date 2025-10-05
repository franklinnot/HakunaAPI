import { Injectable } from '@nestjs/common';
import { Chat } from '../domain/schemas/chat.schema';
import { ChatRepository } from '../domain/repositories/chat.repository';
import { CreateChatDto } from './dto/create-chat.dto';
import { crearRespuesta, Respuesta } from 'src/shared/application/types/respuesta.interface';
import { Model } from 'mongoose';
import { Integrante } from '../domain/schemas/integrante.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario } from 'src/modules/usuarios/domain/schemas/usuario.schema';
import { Estado } from 'src/shared/domain/enums/estado.enum';

@Injectable()
export class ChatService {
    constructor(
        private readonly chatRepository: ChatRepository,

        @InjectModel(Integrante.name)
        private readonly integranteModel: Model<Integrante>,

        @InjectModel(Usuario.name)
        private readonly usuarioModel: Model<Usuario>,

    ) {}

    //#region Genericos

    async findById(id: string): Promise<Respuesta<Chat>> {
        const chat = await this.chatRepository.findById(id);
        if (!chat) {
            return crearRespuesta({
                success: false,
                error: 'El chat no existe.',
            });
        }

        return crearRespuesta({
            success: true,
            data: chat,
        });
    }

    async findAllByUser(userId: string): Promise<Respuesta<Chat[]>> {
        const chats = await this.chatRepository.findAllByUser(userId, this.integranteModel);
        return crearRespuesta({
            success: true,
            data: chats
        });
    }

    // endregion

    // region busquedas especiales
    async findPrivateChatBetweenUsers(userAId: string, userBId: string): Promise<Respuesta<Chat>> {
        const chat = await this.chatRepository.findPrivateChatBetweenUsers(userAId, userBId, this.integranteModel);
        if (!chat) {
      return crearRespuesta({
            success: false,
            error: 'No existe chat privado entre estos usuarios.',
        });
        }
        return crearRespuesta({
        success: true,
        data: chat,
        });
    }

    async searchChatsByName(userId: string, term: string): Promise<Respuesta<Chat[]>> {
        const chats = await this.chatRepository.searchChatsByName(
            term,
            this.integranteModel,
            this.usuarioModel,
            userId,
        );
        return crearRespuesta({
            success: true,
            data: chats,
        });
    }

    // endregion

    // region creacion
    async create(dto: CreateChatDto): Promise<Respuesta<Chat>> {

    // Verificar si ya existe un chat privado entre los usuarios
    if (!dto.is_group && dto.userAId && dto.userBId) {
      const existingChat = await this.chatRepository.findPrivateChatBetweenUsers(
        dto.userAId,
        dto.userBId,
        this.integranteModel,
      );
      if (existingChat) {
        return crearRespuesta({
          success: false,
          error: 'Ya existe un chat privado entre estos usuarios.',
        });
      }
    }

    const newChat = await this.chatRepository.createChat({
      ...dto,
      estado: Estado.HABILITADO,
    } as Chat);

    return crearRespuesta({
      success: true,
      data: newChat,
    });
  }
}
