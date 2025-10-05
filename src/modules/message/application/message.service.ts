import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { Mensaje } from '../domain/schemas/message.schema';
import { MensajeRepository } from '../domain/repositories/message.repositories';
import { CreateMensajeDto } from './dto/create-message.dto';
import { Estado } from 'src/shared/domain/enums/estado.enum';
import {
  Respuesta,
  crearRespuesta,
} from 'src/shared/application/types/respuesta.interface';

@Injectable()
export class MensajeService {
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