import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseDocument } from 'src/shared/domain/persistence/base.document';

@Schema({ collection: 'mensajes', timestamps: true })
export class Mensaje extends BaseDocument {
  @Prop({ type: String, required: true })
  id_integrante: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: true })
  has_files: boolean;

}

export const MensajeSchema = SchemaFactory.createForClass(Mensaje);