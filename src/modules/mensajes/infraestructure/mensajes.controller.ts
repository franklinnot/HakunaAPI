import { Controller, Post, Body } from '@nestjs/common';
import { MensajesService } from '../application/mensajes.service';
import { CreateMensajeDto } from '../application/dtos';

@Controller('mensajes')
export class MensajesController {
  constructor(private readonly mensajeService: MensajesService) {}

  @Post('create')
  register(@Body() createMensajeDto: CreateMensajeDto) {
    return this.mensajeService.create(createMensajeDto);
  }
}
