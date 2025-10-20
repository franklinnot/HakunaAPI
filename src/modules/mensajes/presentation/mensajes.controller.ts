import {
  Controller,
  Post,
  Body,
  Inject,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { EnviarMensajePrivadoDto } from './mensajes.dtos';
import type { IMensajesService } from '../application/mensajes.service.interface';
import type { IRequestWithUser } from 'src/modules/auth/presentation/auth.types';

@Controller('mensajes')
export class MensajesController {
  constructor(
    @Inject('IMensajesService')
    private readonly mensajeService: IMensajesService,
  ) {}

  @Post('privado')
  sendMensajePrivado(
    @Request() req: IRequestWithUser,
    @Body() dto: EnviarMensajePrivadoDto,
  ) {
    const usuario = req.user.data;
    return this.mensajeService.sendMensajePrivado(
      usuario!,
      dto.id_usuarioB,
      dto.descripcion,
      dto.archivos,
    );
  }

  @Get('privado/:id_chat')
  getMensajesPrivados(
    @Request() req: IRequestWithUser,
    @Param('id_chat') id_chat: string,
  ) {
    const usuario = req.user.data;
    return this.mensajeService.getMensajesPrivados(usuario!._id, id_chat);
  }

  @Get('grupal/:id_chat')
  getMensajesGrupales(
    @Request() req: IRequestWithUser,
    @Param('id_chat') id_chat: string,
  ) {
    const usuario = req.user.data;
    return this.mensajeService.getMensajesGrupales(usuario!._id, id_chat);
  }
}
