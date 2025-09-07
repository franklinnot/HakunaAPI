import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from '../schemas/usuario.schema';
import { BaseRepository } from 'src/common/bases/base.repository';

@Injectable()
export class UsuarioRepository extends BaseRepository<Usuario> {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
  ) {
    super(usuarioModel);
  }

  async findByUsername(username: string): Promise<Usuario | null> {
    return this.usuarioModel.findOne({ username }).exec();
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioModel.findOne({ email }).exec();
  }
}
