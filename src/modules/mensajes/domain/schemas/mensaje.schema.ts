import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseDocument } from 'src/shared/domain/persistence/base.document';
import { SchemaTypes } from 'mongoose';

@Schema({ collection: 'mensaje', timestamps: true })
export class Mensaje extends BaseDocument {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Integrante', required: true })
  id_integrante: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: true, default: false })
  has_files: boolean;
}

export const MensajeSchema = SchemaFactory.createForClass(Mensaje);

// virtual populate (no persistente)
MensajeSchema.virtual('viewers', {
  ref: 'Viewer',
  localField: '_id',
  foreignField: 'id_mensaje',
});
