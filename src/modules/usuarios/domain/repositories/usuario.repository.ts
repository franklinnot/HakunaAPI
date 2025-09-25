import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from '../schemas/usuario.schema';
import { BaseRepository } from 'src/shared/domain/persistence/base.repository';

@Injectable()
export class UsuarioRepository extends BaseRepository<Usuario> {
  constructor(
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<Usuario>,
  ) {
    super(usuarioModel);
  }

  async findByUsername(username: string): Promise<Usuario | null> {
    return await this.findOne({ username });
  }

  async existsByUsername(username: string): Promise<boolean> {
    const result = await this.exists({ username });
    return !!result;
  }

  async findByUsernamePass(username: string): Promise<Usuario | null> {
    return this.getModel().findOne({ username }).select('+password').exec();
  }

  async getUserWithPassByUsername(username: string): Promise<Usuario | null> {
    return await this.getModel()
      .findOne({ username })
      .select('+password')
      .exec();
  }
}
