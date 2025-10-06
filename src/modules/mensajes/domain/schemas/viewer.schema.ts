import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseDocument } from 'src/shared/domain/persistence/base.document';
import mongoose, { SchemaTypes } from 'mongoose';

@Schema({ collection: 'viewer', timestamps: true })
export class Viewer extends BaseDocument {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Integrante', required: true })
  id_integrante: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Mensaje', required: true })
  id_mensaje: mongoose.Types.ObjectId;

  @Prop({ required: true, default: false })
  visto: boolean;
}

export const ViewerSchema = SchemaFactory.createForClass(Viewer);
