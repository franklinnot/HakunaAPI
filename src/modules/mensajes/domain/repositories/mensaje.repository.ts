import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mensaje } from '../schemas/mensaje.schema';
import { BaseRepository } from 'src/shared/domain/persistence/base.repository';

@Injectable()
export class MensajeRepository extends BaseRepository<Mensaje> {
  constructor(
    @InjectModel(Mensaje.name)
    private readonly mensajeModel: Model<Mensaje>,
  ) {
    super(mensajeModel);
  }
}
