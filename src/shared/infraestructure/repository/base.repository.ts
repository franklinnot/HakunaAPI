import { Model, Document, UpdateQuery } from 'mongoose';
import { IBaseEntity } from '../../domain/base.entity';
import { Estado } from 'src/shared/domain/enums';
import { QueryFilter } from 'src/shared/infraestructure/infraestructure.types';
import { IBaseRepository } from './base.repository.interface';

export abstract class BaseRepository<
  TEntity extends IBaseEntity,
  TDocument extends Document,
> implements IBaseRepository<TEntity>
{
  protected constructor(protected readonly model: Model<TDocument>) {}

  protected abstract toDomain(doc: TDocument): TEntity;

  getModel(): Model<TDocument> {
    return this.model;
  }

  async exists(filter: QueryFilter<TEntity>): Promise<boolean> {
    return !!(await this.model.exists(filter));
  }

  async existsById(id: string): Promise<boolean> {
    return !!(await this.model.exists({ _id: id }));
  }

  async findById(id: string): Promise<TEntity | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findOne(filter: QueryFilter<TEntity>): Promise<TEntity | null> {
    const doc = await this.model.findOne(filter).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findAll(filter: QueryFilter<TEntity>): Promise<TEntity[]> {
    const docs = await this.model.find(filter).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(data: Partial<TEntity>): Promise<TEntity> {
    const created = new this.model(data);
    const saved = await created.save();
    return this.toDomain(saved);
  }

  async update(id: string, update: Partial<TEntity>): Promise<TEntity | null> {
    const updated = await this.model
      .findByIdAndUpdate(id, update as UpdateQuery<TDocument>, {
        new: true,
      })
      .exec();
    return updated ? this.toDomain(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    return !!(await this.model.findByIdAndDelete(id).exec());
  }

  async disable(id: string): Promise<TEntity | null> {
    return this.update(id, {
      estado: Estado.DESHABILITADO,
    } as Partial<TEntity>);
  }

  async enable(id: string): Promise<TEntity | null> {
    return this.update(id, { estado: Estado.HABILITADO } as Partial<TEntity>);
  }
}
