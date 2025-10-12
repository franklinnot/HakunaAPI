import { Estado } from './enums';

export interface IBaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  estado: Estado;
}
