import { Controller, Post, Body, Inject, Request } from '@nestjs/common';
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
  enviarMensajePrivado(
    @Request() req: IRequestWithUser,
    @Body() dto: EnviarMensajePrivadoDto,
  ) {
    const usuario = req.user.data;
    return this.mensajeService.enviarMensajePrivado(
      usuario!.id_usuario,
      dto.id_usuarioB,
      dto.descripcion,
      dto.archivos,
    );
  }
}
