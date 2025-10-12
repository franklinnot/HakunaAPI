import { IBaseEntity } from 'src/shared/domain/base.entity';

export interface IUsuario extends IBaseEntity {
  id_foto: string | null;
  nombre: string;
  username: string;
  password: string;
}
