import { Injectable } from '@nestjs/common';
import { IRespuesta } from 'src/shared/application/response';
import { IMensajesService } from './mensajes.service.interface';
import { IMensajeResponse } from './mensajes.responses';
import { CrearMensaje, ICrearArchivo } from './crear-mesaje';

@Injectable()
export class MensajesService implements IMensajesService {
  constructor(private readonly crearMensajeService: CrearMensaje) {}
  crearMensaje(
    id_integrante: string,
    descripcion?: string,
    archivos?: ICrearArchivo[],
  ): Promise<IRespuesta<IMensajeResponse>> {
    return this.crearMensajeService.execute(
      id_integrante,
      descripcion,
      archivos,
    );
  }
}
