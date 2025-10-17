import { Controller, Post, Body, Inject } from '@nestjs/common';
import { CreateMensajeDto } from './mensajes.dtos';
import type { IMensajesService } from '../application/mensajes.service.interface';

@Controller('mensajes')
export class MensajesController {
  constructor(
    @Inject('IMensajesService')
    private readonly mensajeService: IMensajesService,
  ) {}

  @Post()
  crearMensaje(@Body() dto: CreateMensajeDto) {
    return this.mensajeService.crearMensaje(
      dto.id_integrante,
      dto.descripcion,
      dto.archivos,
    );
  }
}
