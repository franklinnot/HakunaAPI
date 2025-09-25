import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Estado } from 'src/shared/domain/enums/estado.enum';

export abstract class BaseDocument extends Document {
  @Prop({
    type: String,
    enum: Estado,
    default: Estado.HABILITADO,
  })
  estado: Estado;
}
