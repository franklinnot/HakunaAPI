import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from 'src/shared/infraestructure/schema/base.schema';
import { IViewer } from '../../domain/mensajes.entities';

@Schema({ collection: 'viewer', timestamps: true })
export class Viewer extends BaseSchema implements IViewer {
  @Prop({ type: String, ref: 'Integrante', required: true })
  id_integrante: string;

  @Prop({ type: String, ref: 'Mensaje', required: true })
  id_mensaje: string;

  @Prop({ required: true, default: false })
  visto: boolean;
}

export const ViewerSchema = SchemaFactory.createForClass(Viewer);
