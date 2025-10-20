import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from '../schemas/usuario.schema';
import { BaseRepository } from 'src/shared/infraestructure/repository/base.repository';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import { Estado } from 'src/shared/domain/enums';
import { IUsuarioRepository } from '../usuarios.repositories.interfaces';

@Injectable()
export class UsuarioRepository
  extends BaseRepository<IUsuario, Usuario>
  implements IUsuarioRepository
{
  constructor(
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<Usuario>,
  ) {
    super(usuarioModel);
  }

  protected toDomain(doc: Usuario): IUsuario {
    return {
      _id: doc._id || '',
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
      estado: doc.estado || Estado.HABILITADO,
      //
      id_foto: doc.id_foto || null,
      nombre: doc.nombre || '',
      username: doc.username || '',
      password: doc.password || '',
    };
  }

  async findOneByUsernameWithPass(username: string): Promise<IUsuario | null> {
    const doc = await this.getModel()
      .findOne({ username })
      .select('+password')
      .lean()
      .exec();
    return doc ? this.toDomain(doc) : null;
  }
}
