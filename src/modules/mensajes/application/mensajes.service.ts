import { Injectable } from '@nestjs/common';
import { IRespuesta } from 'src/shared/application/response';
import { IMensajesService } from './mensajes.service.interface';
import { IMensajeResponse } from './mensajes.responses';
import { EnviarMensajePrivado, ICrearArchivo } from './enviar-mensaje-privado';

@Injectable()
export class MensajesService implements IMensajesService {
  constructor(private readonly enviarMensajeService: EnviarMensajePrivado) {}
  enviarMensajePrivado(
    id_usuarioA: string,
    id_usuarioB: string,
    descripcion?: string,
    archivos?: ICrearArchivo[],
  ): Promise<IRespuesta<IMensajeResponse>> {
    return this.enviarMensajeService.execute(
      id_usuarioA,
      id_usuarioB,
      descripcion,
      archivos,
    );
  }
}
