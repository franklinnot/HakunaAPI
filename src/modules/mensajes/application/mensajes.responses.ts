import { IArchivoResponse } from 'src/modules/archivos/application/archivos.responses';
import { Estado } from 'src/shared/domain/enums';

export interface IMensajeResponse {
  id_mensaje: string;
  id_usuario: string; // quien lo envio
  id_chat: string; // a que chat
  es_grupal: boolean; // si es para un chat grupal
  descripcion: string | null;
  has_files: boolean;
  createdAt: Date;
  archivos: IArchivoResponse[] | null;
  estado: Estado;
}
