import { Inject, Injectable } from '@nestjs/common';
import type { IMensajeRepository } from '../infraestructure/mensajes.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IMensajesService } from './mensajes.service.interface';
import { IMensajeResponse } from './mensajes.responses';

@Injectable()
export class MensajesService implements IMensajesService {
  constructor(
    @Inject('IMensajeRepository')
    private readonly mensajeRepository: IMensajeRepository,
  ) {}
  createMensaje(
    id_integrante: string,
    descripcion: string,
    has_files: boolean,
    archivos: string[],
  ): Promise<IRespuesta<IMensajeResponse>> {
    throw new Error('Method not implemented.');
  }
}
