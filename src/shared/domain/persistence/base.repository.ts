import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { BaseDocument } from './base.document';
import { Estado } from 'src/shared/domain/enums/estado.enum';

export abstract class BaseRepository<T extends BaseDocument> {
  protected constructor(private readonly model: Model<T>) {
    this.model = model;
  }
  public getModel(): Model<T> {
    return this.model;
  }

  async exists(filterQuery: FilterQuery<T>): Promise<boolean> {
    const result = await this.model.exists(filterQuery);
    return !!result;
  }

  async existsById(id: string): Promise<boolean> {
    const result = await this.model.exists({ _id: id });
    return !!result;
  }

  async findAll(filterQuery: FilterQuery<T>): Promise<T[]> {
    return this.model.find(filterQuery).exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filterQuery: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filterQuery).exec();
  }

  async create(createDto: any): Promise<T> {
    const createdModel = new this.model(createDto);
    return createdModel.save();
  }

  async update(id: string, updateDto: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async disable(id: string): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, { estado: Estado.DESHABILITADO }, { new: true })
      .exec();
  }

  async enable(id: string): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, { estado: Estado.HABILITADO }, { new: true })
      .exec();
  }
}
