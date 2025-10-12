import { Model, Document } from 'mongoose';
import { IBaseEntity } from '../../domain/base.entity';
import { Estado } from 'src/shared/domain/enums';
import { QueryFilter } from 'src/shared/infraestructure/infraestructure.types';
import { IBaseRepository } from './base.repository.interface';
import type { Persistence } from 'src/shared/infraestructure/infraestructure.types';

export abstract class BaseRepository<
  TEntity extends IBaseEntity,
  TDocument extends Document,
> implements IBaseRepository<TEntity>
{
  protected constructor(protected readonly model: Model<TDocument>) {}

  protected abstract toDomain(doc: TDocument): TEntity;

  protected abstract toPersistence(
    entity: Partial<TEntity>,
  ): Persistence<TEntity>;

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
    const persistence = this.toPersistence(data);
    const created = new this.model(persistence);
    const saved = await created.save();
    return this.toDomain(saved);
  }

  async update(id: string, update: Partial<TEntity>): Promise<TEntity | null> {
    const persistence = this.toPersistence(update);
    const updated = await this.model
      .findByIdAndUpdate(id, persistence, { new: true })
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
