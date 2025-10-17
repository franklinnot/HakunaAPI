import { IRespuesta } from 'src/shared/application/response';
import { IMensajeResponse } from './mensajes.responses';
import { ICrearArchivo } from './enviar-mensaje-privado';

export interface IMensajesService {
  enviarMensajePrivado(
    id_usuarioA: string,
    id_usuarioB: string,
    descripcion?: string,
    archivos?: ICrearArchivo[],
  ): Promise<IRespuesta<IMensajeResponse>>;
}
