import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { BaseDocument } from 'src/common/bases/base.schema';

@Schema({ collection: 'usuario', timestamps: true })
export class Usuario extends BaseDocument {
  @Prop({ type: String, ref: 'Archivo', required: false, default: null })
  id_fotoPerfil: string;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, select: false })
  password: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);

// HOOKS

// hashear la contraseña si ha sido modificada o es nueva
UsuarioSchema.pre<Usuario>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
