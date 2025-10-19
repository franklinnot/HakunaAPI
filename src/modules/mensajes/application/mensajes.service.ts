import { Injectable } from '@nestjs/common';
import { IRespuesta } from 'src/shared/application/response';
import { IMensajesService } from './mensajes.service.interface';
import { IMensajeResponse } from './mensajes.responses';
import {
  EnviarMensajePrivado,
  ICrearArchivo,
} from './use-cases/enviar-mensaje-privado';
import { GetMensajesPrivados } from './use-cases/get-mensajes-privados';
import { GetMensajesGrupales } from './use-cases/get-mensajes-grupales';

@Injectable()
export class MensajesService implements IMensajesService {
  constructor(
    private readonly enviarMensajeService: EnviarMensajePrivado,
    private readonly getMensajesService: GetMensajesPrivados,
    private readonly getMensajesGrupalesService: GetMensajesGrupales,
  ) {}
  getMensajesPrivados(
    id_usuario: string,
    id_chat: string,
  ): Promise<IRespuesta<IMensajeResponse[]>> {
    return this.getMensajesService.execute(id_usuario, id_chat);
  }
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
  getMensajesGrupales(
    id_usuario: string,
    id_chat: string,
  ): Promise<IRespuesta<IMensajeResponse[]>> {
    return this.getMensajesGrupalesService.execute(id_usuario, id_chat);
  }
}
