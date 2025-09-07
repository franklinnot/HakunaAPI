import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { BaseDocument } from 'src/common/bases/base.schema';

@Schema({ collection: 'usuario', timestamps: true })
export class Usuario extends BaseDocument {
  @Prop({ type: String, ref: 'Archivo', required: false, default: null })
  id_fotoPerfil: string;

  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);

// HOOKS

// Hashear la contraseña antes de guardar
UsuarioSchema.pre<Usuario>('save', async function (next) {
  // Solo hashea la contraseña si ha sido modificada o es nueva)
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
