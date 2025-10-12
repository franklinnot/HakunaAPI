import { IBaseEntity } from 'src/shared/domain/base.entity';

export interface IChat extends IBaseEntity {
  id_foto: string | null;
  nombre: string | null;
  descripcion: string;
  is_group: boolean;
  cantidad_integrantes: number;
}

export interface IIntegrante extends IBaseEntity {
  id_chat: string;
  id_usuario: string;
  is_admin: boolean;
}
