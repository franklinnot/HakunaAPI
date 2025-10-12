import { Controller, Get, Inject, Param, Post, Request } from '@nestjs/common';
import type { IChatsService } from '../application/chats.service.interface';
import type { IRequestWithUser } from 'src/modules/auth/presentation/auth.types';

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

  // Crear chat privado
  @Get('get-privados')
  async getChatsPrivados(@Request() req: IRequestWithUser) {
    const usuario = req.user.data;
    return await this.chatsService.getChatsPrivados(usuario!.id_usuario);
  }
}
