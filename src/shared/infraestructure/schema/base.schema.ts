import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IBaseEntity } from 'src/shared/domain/base.entity';
import { Estado } from 'src/shared/domain/enums';

@Schema({ timestamps: true, versionKey: false })
export abstract class BaseSchema
  extends Document<string>
  implements IBaseEntity
{
  @Prop({ type: String, default: uuidv4 })
  declare _id: string;

  @Prop({ type: Date, default: Date.now })
  declare createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  declare updatedAt: Date;

  @Prop({ type: String, enum: Estado, default: Estado.HABILITADO })
  estado: Estado;
}
