import { Body, Controller, Get, Inject, Param, Post, Put, Request } from '@nestjs/common';
import type { IChatsService } from '../application/chats.service.interface';
import type { IRequestWithUser } from 'src/modules/auth/presentation/auth.types';
import { CreateChatGrupalDto, UpdateChatGrupalDto } from './chats.dtos';

@Controller('chats')
export class ChatsController {
  constructor(
    @Inject('IChatsService')
    private readonly chatsService: IChatsService,
  ) {}

  // Crear chat privado
  @Post('create-privado/:id_usuarioB')
  async createChatPrivado(
    @Request() req: IRequestWithUser,
    @Param('id_usuarioB') id_usuarioB: string,
  ) {
    const usuario = req.user.data;
    return await this.chatsService.createChatPrivado(
      usuario!.id_usuario,
      id_usuarioB,
    );
  }

  // Crear chat grupal
  @Post('create-grupal')
  async createChatGrupal(
    @Request() req: IRequestWithUser,
    @Body() createChatGrupalDto: CreateChatGrupalDto,
  ) {
    const usuario = req.user.data;
    return await this.chatsService.createChatGrupal(
      createChatGrupalDto.foto || null,
      createChatGrupalDto.nombre,
      createChatGrupalDto.descripcion || '',
      usuario!.id_usuario,
      createChatGrupalDto.integrantes,
    );
  }

  // obtener todos los chats privados
  @Get('get-privados')
  async getChatsPrivados(@Request() req: IRequestWithUser) {
    const usuario = req.user.data;
    return await this.chatsService.getChatsPrivados(usuario!.id_usuario);
  }

  // obtener todos los chats grupales
  @Get('get-grupales')
  async getChatsGrupales(@Request() req: IRequestWithUser) {
    const usuario = req.user.data;
    return await this.chatsService.getChatsGrupales(usuario!.id_usuario);
  }

  // obtener un chat privado
  @Get('get-privado/:id_chat')
  async getChatPrivado(
    @Request() req: IRequestWithUser,
    @Param('id_chat') id_chat: string,
  ) {
    const usuario = req.user.data;
    return await this.chatsService.getChatPrivado(id_chat, usuario!.id_usuario);
  }

  // actualizar chat grupal
  @Put('update-grupal/:id_chat')
  async updateChatGrupal(
    @Request() req: IRequestWithUser,
    @Param('id_chat') id_chat: string,
    @Body() updateChatGrupalDto: UpdateChatGrupalDto,
  ) {
    const usuario = req.user.data;
    return await this.chatsService.updateChatGrupal(
      id_chat,
      usuario!.id_usuario,
      updateChatGrupalDto.foto,
      updateChatGrupalDto.nombre,
      updateChatGrupalDto.descripcion,
    );
  }
}
