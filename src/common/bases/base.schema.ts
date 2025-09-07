import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EstadoEnum } from '../enums/estado.enum';

export abstract class BaseDocument extends Document {
  @Prop({
    type: String,
    enum: EstadoEnum,
    default: EstadoEnum.HABILITADO,
  })
  estado: EstadoEnum;
}
