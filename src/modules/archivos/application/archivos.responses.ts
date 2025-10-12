import { Estado, TipoArchivo } from 'src/shared/domain/enums';

export interface IArchivoResponse {
  id_archivo: string;
  nombre: string;
  link: string | null;
  tipo_archivo: TipoArchivo;
  extension: string;
  estado: Estado;
}
