import { IRespuesta } from 'src/shared/application/response';
import { IMensajeResponse } from './mensajes.responses';
import { ICrearArchivo } from './crear-mesaje';

export interface IMensajesService {
  crearMensaje(
    id_integrante: string,
    descripcion?: string,
    archivos?: ICrearArchivo[],
  ): Promise<IRespuesta<IMensajeResponse>>;
}
