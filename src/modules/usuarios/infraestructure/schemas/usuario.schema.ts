import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { BaseSchema } from 'src/shared/infraestructure/schema/base.schema';
import { IUsuario } from '../../domain/usuarios.entities';

@Schema({ collection: 'usuario', timestamps: true })
export class Usuario extends BaseSchema implements IUsuario {
  @Prop({ type: String, ref: 'Archivo', required: false, default: null })
  id_foto: string | null;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, select: false })
  password: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);

UsuarioSchema.virtual('integrantes', {
  ref: 'Integrante',
  localField: '_id',
  foreignField: 'id_usuario',
});

UsuarioSchema.pre<Usuario>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
