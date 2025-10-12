import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from 'src/shared/infraestructure/schema/base.schema';
import { IChat } from '../../domain/chats.entities';

@Schema({ collection: 'chat', timestamps: true })
export class Chat extends BaseSchema implements IChat {
  @Prop({
    type: String,
    ref: 'Archivo',
    required: false,
    default: null,
  })
  id_foto: string | null;

  @Prop({ type: String, required: false, default: null })
  nombre: string;

  @Prop({ type: String, required: false, default: null })
  descripcion: string;

  @Prop({ type: Boolean, required: true })
  is_group: boolean;

  @Prop({ type: Number, required: true })
  cantidad_integrantes: number;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

ChatSchema.virtual('integrantes', {
  ref: 'Integrante',
  localField: '_id',
  foreignField: 'id_chat',
});
