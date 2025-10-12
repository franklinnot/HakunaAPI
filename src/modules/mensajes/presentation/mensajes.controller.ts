import { Controller, Post, Body, Inject } from '@nestjs/common';
import { MensajesService } from 'src/modules/mensajes/application/mensajes.service';
import { CreateMensajeDto } from './mensajes.dtos';

@Controller('mensajes')
export class MensajesController {
  constructor(
    @Inject('IMensajesService')
    private readonly mensajeService: MensajesService,
  ) {}

  @Post('create')
  register(@Body() dto: CreateMensajeDto) {
    return this.mensajeService.createMensaje(
      dto.id_integrante,
      dto.descripcion,
      dto.has_files,
      dto.archivos,
    );
  }
}
