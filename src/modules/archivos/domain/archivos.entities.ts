import { TipoArchivo } from 'src/shared/domain/enums';
import { IBaseEntity } from 'src/shared/domain/base.entity';

export interface IArchivo extends IBaseEntity {
  nombre: string | null;
  link: string | null;
  tipo_archivo: TipoArchivo;
  extension: string;
  filekey: string;
  size: string;
}
