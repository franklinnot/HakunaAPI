import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from 'src/shared/infraestructure/schema/base.schema';
import { IDetalleMensaje } from '../../domain/mensajes.entities';

@Schema({ collection: 'detalle_mensaje', timestamps: true })
export class DetalleMensaje extends BaseSchema implements IDetalleMensaje {
  @Prop({ type: String, ref: 'Archivo', required: true })
  id_archivo: string;

  @Prop({ type: String, ref: 'Mensaje', required: true })
  id_mensaje: string;
}

export const DetalleMensajeSchema =
  SchemaFactory.createForClass(DetalleMensaje);
