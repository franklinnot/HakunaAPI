import { Injectable } from '@nestjs/common';
import { Mensaje } from '../domain/schemas/mensaje.schema';
import { MensajeRepository } from '../domain/repositories/mensaje.repository';
import { CreateMensajeDto } from './dtos';
import { Respuesta, crearRespuesta } from 'src/shared/application/types';

@Injectable()
export class MensajesService {
  constructor(private readonly mensajeRepository: MensajeRepository) {}

  async create(dto: CreateMensajeDto): Promise<Respuesta<Mensaje>> {
    const newMensaje = await this.mensajeRepository.create(dto);
    const mensajeObject: Partial<Mensaje> = newMensaje.toObject<Mensaje>();

    return crearRespuesta({
      success: true,
      data: mensajeObject as Mensaje,
    });
  }
}
