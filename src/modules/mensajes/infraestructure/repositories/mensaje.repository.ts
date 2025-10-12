import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMensaje } from '../../domain/mensajes.entities';
import { Mensaje } from '../schemas/mensaje.schema';
import { BaseRepository } from 'src/shared/infraestructure/repository/base.repository';
import { Estado } from 'src/shared/domain/enums';
import { IMensajeRepository } from '../mensajes.repositories.interfaces';
import type { IIntegranteRepository } from 'src/modules/chats/infraestructure/chats.repositories.interfaces';
import { Persistence } from '../../../../shared/infraestructure/infraestructure.types';

@Injectable()
export class MensajeRepository
  extends BaseRepository<IMensaje, Mensaje>
  implements IMensajeRepository
{
  constructor(
    @Inject('IIntegranteRepository')
    private readonly integranteRepository: IIntegranteRepository,
    @InjectModel(Mensaje.name)
    private readonly mensajeModel: Model<Mensaje>,
  ) {
    super(mensajeModel);
  }

  protected toDomain(doc: Mensaje): IMensaje {
    return {
      _id: doc._id ?? '',
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
      estado: doc.estado ?? Estado.HABILITADO,
      //
      id_integrante: doc.id_integrante ?? null,
      descripcion: doc.descripcion ?? '',
      has_files: doc.has_files ?? false,
    };
  }

  protected toPersistence(entity: Partial<IMensaje>): Persistence<IMensaje> {
    return {
      estado: entity.estado,
      id_integrante: entity.id_integrante,
      descripcion: entity.descripcion,
      has_files: entity.has_files,
    } as Persistence<IMensaje>;
  }

  async findAllByChatId(id_chat: string): Promise<IMensaje[]> {
    const integrantes = await this.integranteRepository
      .getModel()
      .find({ id_chat, estado: Estado.HABILITADO })
      .select('_id')
      .exec();

    const integranteIds = integrantes.map((i) => i._id);

    // Luego, obtén todos los mensajes de esos integrantes
    const mensajes = await this.mensajeModel
      .find({
        id_integrante: { $in: integranteIds },
        estado: Estado.HABILITADO,
      })
      .sort({ createdAt: -1 }) // orden descendente
      .exec();

    return mensajes.map((doc) => this.toDomain(doc));
  }

  async findUltimoMensajeByChatId(id_chat: string): Promise<IMensaje | null> {
    // obtener los IDs de los integrantes del chat
    const integrantes = await this.integranteRepository
      .getModel()
      .find({ id_chat })
      .select('_id')
      .exec();

    if (integrantes.length == 0) {
      return null;
    }

    const integranteIds = integrantes.map((i) => i._id);

    // buscar el mensaje más reciente de esos integrantes
    const ultimoMensaje = await this.mensajeModel
      .findOne({
        id_integrante: { $in: integranteIds },
        estado: Estado.HABILITADO,
      })
      .sort({ createdAt: -1 }) // más reciente primero
      .lean()
      .exec();

    return ultimoMensaje ? this.toDomain(ultimoMensaje) : null;
  }
}
