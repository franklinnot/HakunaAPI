import { Estado, TipoArchivo } from 'src/shared/domain/enums';

export interface IArchivoResponse {
  id_archivo: string;
  nombre: string | null;
  link: string | null;
  tipo_archivo: TipoArchivo;
  extension: string;
  size: string;
  estado: Estado;
}
