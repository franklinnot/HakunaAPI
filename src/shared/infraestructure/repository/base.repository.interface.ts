import { Model } from 'mongoose';
import { IBaseEntity } from 'src/shared/domain/base.entity';
import { QueryFilter } from '../infraestructure.types';

export interface IBaseRepository<T extends IBaseEntity> {
  getModel(): Model<any>;
  exists(filter: QueryFilter<T>): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
  findAll(filter: QueryFilter<T>): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  findOne(filter: QueryFilter<T>): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, update: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  disable(id: string): Promise<T | null>;
  enable(id: string): Promise<T | null>;
}
