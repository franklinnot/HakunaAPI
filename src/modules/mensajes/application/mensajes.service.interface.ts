import { IRespuesta } from 'src/shared/application/response';
import { IMensajeResponse } from './mensajes.responses';

export interface IMensajesService {
  createMensaje(
    id_integrante: string,
    descripcion: string,
    has_files: boolean,
    archivos: string[],
  ): Promise<IRespuesta<IMensajeResponse>>;
}
