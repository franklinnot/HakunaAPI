import {
  Controller,
  Post,
  Body,
  Inject,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { EnviarMensajePrivadoDto, EnviarMensajeGrupalDto } from './mensajes.dtos';
import type { IMensajesService } from '../application/mensajes.service.interface';
import type { IRequestWithUser } from 'src/modules/auth/presentation/auth.types';

@Controller('mensajes')
export class MensajesController {
  constructor(
    @Inject('IMensajesService')
    private readonly mensajeService: IMensajesService,
  ) {}

  @Post('privado/:id_usuarioB')
  sendMensajePrivado(
    @Request() req: IRequestWithUser,
    @Body() dto: EnviarMensajePrivadoDto,
    @Param('id_usuarioB') id_usuarioB: string,
  ) {
    const usuario = req.user.data;
    return this.mensajeService.sendMensajePrivado(
      usuario!,
      id_usuarioB,
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

  @Post('grupal/:id_chat')
  sendMensajeGrupal(
    @Request() req: IRequestWithUser,
    @Body() dto: EnviarMensajeGrupalDto,
    @Param('id_chat') id_chat: string,
  ) {
    const usuario = req.user.data;
    return this.mensajeService.sendMensajeGrupal(
      usuario!,
      id_chat,
      dto.descripcion,
      dto.archivos,
    );
  }
}
