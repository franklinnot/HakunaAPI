import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from 'src/shared/infraestructure/schema/base.schema';
import { TipoArchivo } from 'src/shared/domain/enums';
import { IArchivo } from '../../domain/archivos.entities';

@Schema({ collection: 'archivo', timestamps: true })
export class Archivo extends BaseSchema implements IArchivo {
  @Prop({ type: String, required: false, default: null })
  nombre: string;

  @Prop({ type: String, required: false, default: null })
  link: string;

  @Prop({
    type: String,
    enum: TipoArchivo,
    default: TipoArchivo.DOCUMENTO,
    required: false,
  })
  tipo_archivo: TipoArchivo;

  @Prop({ type: String, required: true })
  extension: string;

  @Prop({ type: String, required: true })
  size: string;

  @Prop({ type: String, required: false, default: null })
  filekey: string;
}

export const ArchivoSchema = SchemaFactory.createForClass(Archivo);

ArchivoSchema.virtual('chats', {
  ref: 'Chat',
  localField: '_id',
  foreignField: 'id_foto',
});

ArchivoSchema.virtual('usuarios', {
  ref: 'Usuario',
  localField: '_id',
  foreignField: 'id_foto',
});

ArchivoSchema.virtual('detalles', {
  ref: 'DetalleMensaje',
  localField: '_id',
  foreignField: 'id_archivo',
});
