import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Estado } from '../enums';

export abstract class BaseDocument extends Document {
  @Prop({
    type: String,
    enum: Estado,
    default: Estado.HABILITADO,
  })
  estado: Estado;
}
