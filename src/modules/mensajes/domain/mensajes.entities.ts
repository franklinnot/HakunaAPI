import { IBaseEntity } from 'src/shared/domain/base.entity';

export interface IMensaje extends IBaseEntity {
  id_integrante: string;
  descripcion: string | null;
  has_files: boolean;
}

export interface IDetalleMensaje extends IBaseEntity {
  id_archivo: string;
  id_mensaje: string;
}

export interface IViewer extends IBaseEntity {
  id_integrante: string;
  id_mensaje: string;
  visto: boolean;
}
