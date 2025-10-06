import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ChatService } from "../application/chat.service";
import { CreateChatDto } from "../application/dto/create-chat.dto";

@Controller('chats')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

     // Obtener chat por ID
  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.chatService.findById(id);
  }

  // Listar todos los chats de un usuario
  @Get('by-user/:userId')
  async findAllByUser(@Param('userId') userId: string) {
    return await this.chatService.findAllByUser(userId);
  }

  // Buscar chat privado entre dos usuarios
  @Get('private/:userAId/:userBId')
  async findPrivateChat(
    @Param('userAId') userAId: string,
    @Param('userBId') userBId: string,
  ) {
    return await this.chatService.findPrivateChatBetweenUsers(userAId, userBId);
  }

  // Buscar chats por nombre
  @Get('search/:userId')
  async searchChats(
    @Param('userId') userId: string,
    @Query('term') term: string,
  ) {
    return await this.chatService.searchChatsByName(userId, term);
  }

  // Crear un nuevo chat
  @Post()
  async create(@Body() dto: CreateChatDto) {
    return await this.chatService.create(dto);
  }

}