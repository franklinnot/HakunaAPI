import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Viewer } from '../schemas/viewer.schema';
import { BaseRepository } from 'src/shared/domain/persistence/base.repository';

@Injectable()
export class ViewerRepository extends BaseRepository<Viewer> {
  constructor(
    @InjectModel(Viewer.name)
    private readonly mensajeModel: Model<Viewer>,
  ) {
    super(mensajeModel);
  }
}
