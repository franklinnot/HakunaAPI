import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from 'src/shared/infraestructure/schema/base.schema';
import { IIntegrante } from '../../domain/chats.entities';

@Schema({ collection: 'integrante', timestamps: true })
export class Integrante extends BaseSchema implements IIntegrante {
  @Prop({ type: String, ref: 'Chat', required: true })
  id_chat: string;

  @Prop({ type: String, ref: 'Usuario', required: true })
  id_usuario: string;

  @Prop({ type: Boolean, required: true, default: false })
  is_admin: boolean;
}

export const IntegranteSchema = SchemaFactory.createForClass(Integrante);

IntegranteSchema.virtual('mensajes', {
  ref: 'Mensaje',
  localField: '_id',
  foreignField: 'id_integrante',
});

IntegranteSchema.virtual('viewers', {
  ref: 'Viewer',
  localField: '_id',
  foreignField: 'id_integrante',
});
