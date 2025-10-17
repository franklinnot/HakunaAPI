import { IArchivoResponse } from 'src/modules/archivos/application/archivos.responses';
import { Estado } from 'src/shared/domain/enums';

export interface IMensajeResponse {
  id_mensaje: string;
  id_integrante: string;
  descripcion: string | null;
  has_files: boolean;
  createdAt: Date;
  archivos: IArchivoResponse[] | null;
  estado: Estado;
}
