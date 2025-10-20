import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IIntegrante } from '../../domain/chats.entities';
import { BaseRepository } from 'src/shared/infraestructure/repository/base.repository';
import { Integrante } from '../schemas/integrante.schema';
import { Estado } from 'src/shared/domain/enums';
import { IIntegranteRepository } from '../chats.repositories.interfaces';

@Injectable()
export class IntegranteRepository
  extends BaseRepository<IIntegrante, Integrante>
  implements IIntegranteRepository
{
  constructor(
    @InjectModel(Integrante.name)
    private readonly integranteModel: Model<Integrante>,
  ) {
    super(integranteModel);
  }

  protected toDomain(doc: Integrante): IIntegrante {
    return {
      _id: doc._id || '',
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
      estado: doc.estado || Estado.HABILITADO,
      //
      id_chat: doc.id_chat || '',
      id_usuario: doc.id_usuario || '',
      is_admin: doc.is_admin || false,
    };
  }

  async registerIntegrantes(
    id_chat: string,
    usuarios: { id_usuario: string; is_admin: boolean }[],
  ): Promise<IIntegrante[]> {
    const result = await Promise.all(
      usuarios.map((i) =>
        this.integranteModel.create({
          id_chat: id_chat,
          id_usuario: i.id_usuario,
          is_admin: i.is_admin,
        }),
      ),
    );
    return result.map((doc) => this.toDomain(doc));
  }
}
