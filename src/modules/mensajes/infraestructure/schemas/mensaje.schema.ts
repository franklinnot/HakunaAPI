import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from 'src/shared/infraestructure/schema/base.schema';
import { IMensaje } from '../../domain/mensajes.entities';

@Schema({ collection: 'mensaje', timestamps: true })
export class Mensaje extends BaseSchema implements IMensaje {
  @Prop({ type: String, ref: 'Integrante', required: true })
  id_integrante: string;

  @Prop({ required: false, default: null })
  descripcion: string;

  @Prop({ required: true, default: false })
  has_files: boolean;
}

export const MensajeSchema = SchemaFactory.createForClass(Mensaje);

MensajeSchema.virtual('viewers', {
  ref: 'Viewer',
  localField: '_id',
  foreignField: 'id_mensaje',
});

MensajeSchema.virtual('detalle_mensaje', {
  ref: 'DetalleMensaje',
  localField: '_id',
  foreignField: 'id_mensaje',
});
