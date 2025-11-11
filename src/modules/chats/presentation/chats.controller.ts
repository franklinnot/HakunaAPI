import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import type { IChatsService } from '../application/chats.service.interface';
import type { IRequestWithUser } from 'src/modules/auth/presentation/auth.types';
import {
  CreateChatGrupalDto,
  UpdateChatGrupalDto,
  AddMemberDto,
} from './chats.dtos';

@Controller('chats')
export class ChatsController {
  constructor(
    @Inject('IChatsService')
    private readonly chatsService: IChatsService,
  ) {}

  // Crear chat grupal
  @Post('grupal')
  async crearChatGrupal(
    @Request() req: IRequestWithUser,
    @Body() dto: CreateChatGrupalDto,
  ) {
    const usuario = req.user.data;
    return await this.chatsService.crearChatGrupal(
      usuario!,
      dto.integrantes,
      dto.nombre,
      dto.descripcion,
      dto.foto,
    );
  }

  // obtener todos los chats privados
  @Get('privados')
  async getChatsPrivados(@Request() req: IRequestWithUser) {
    const usuario = req.user.data;
    return await this.chatsService.getChatsPrivados(usuario!._id);
  }

  // obtener todos los chats grupales
  @Get('grupales')
  async getChatsGrupales(@Request() req: IRequestWithUser) {
    const usuario = req.user.data;
    return await this.chatsService.getChatsGrupales(usuario!._id);
  }

  // obtener un chat privado
  @Get('privado/:id_chat')
  async getChatPrivado(
    @Request() req: IRequestWithUser,
    @Param('id_chat') id_chat: string,
  ) {
    const usuario = req.user.data;
    return await this.chatsService.getChatPrivado(usuario!._id, id_chat);
  }

  // obtener un chat grupal
  @Get('grupal/:id_chat')
  async getChatGrupal(
    @Request() req: IRequestWithUser,
    @Param('id_chat') id_chat: string,
  ) {
    const usuario = req.user.data;
    return await this.chatsService.getChatGrupal(id_chat, usuario!._id);
  }

  // actualizar chat grupal
  @Put('grupal/:id_chat')
  async updateChatGrupal(
    @Request() req: IRequestWithUser,
    @Param('id_chat') id_chat: string,
    @Body() dto: UpdateChatGrupalDto,
  ) {
    const usuario = req.user.data;
    return await this.chatsService.updateChatGrupal(
      usuario!._id,
      id_chat,
      dto.nombre,
      dto.descripcion,
      dto.foto,
    );
  }

  // agregar miembro a grupo
  @Post('grupal/:id_chat/miembros')
  async addMemberToGroup(
    @Request() req: IRequestWithUser,
    @Param('id_chat') id_chat: string,
    @Body() dto: AddMemberDto,
  ) {
    const usuario = req.user.data;
    return await this.chatsService.addMemberToGroup(
      usuario!._id,
      id_chat,
      dto.id_usuario,
    );
  }

  // eliminar miembro de grupo
  @Delete('grupal/:id_chat/miembros/:id_usuario')
  async removeMemberFromGroup(
    @Request() req: IRequestWithUser,
    @Param('id_chat') id_chat: string,
    @Param('id_usuario') id_usuario: string,
  ) {
    const usuario = req.user.data;
    return await this.chatsService.removeMemberFromGroup(
      usuario!._id,
      id_chat,
      id_usuario,
    );
  }

  // eliminar grupo
  @Delete('grupal/:id_chat')
  async deleteGroup(
    @Request() req: IRequestWithUser,
    @Param('id_chat') id_chat: string,
  ) {
    const usuario = req.user.data;
    return await this.chatsService.deleteGroup(usuario!._id, id_chat);
  }
}
