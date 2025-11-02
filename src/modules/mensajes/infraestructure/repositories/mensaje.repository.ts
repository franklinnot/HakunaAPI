import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMensaje } from '../../domain/mensajes.entities';
import { Mensaje } from '../schemas/mensaje.schema';
import { BaseRepository } from 'src/shared/infraestructure/repository/base.repository';
import { Estado } from 'src/shared/domain/enums';
import { IMensajeRepository } from '../mensajes.repositories.interfaces';
import type { IIntegranteRepository } from 'src/modules/chats/infraestructure/chats.repositories.interfaces';

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
      _id: doc._id || '',
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
      estado: doc.estado || Estado.HABILITADO,
      //
      id_integrante: doc.id_integrante || '',
      descripcion: doc.descripcion || null,
      has_files: doc.has_files || false,
    };
  }

  async findAllByChatId(id_chat: string): Promise<IMensaje[]> {
    // Obtener todos los integrantes del chat (habilitados y deshabilitados)
    // para mantener el historial completo de mensajes
    const integrantes = await this.integranteRepository.findAll({
      id_chat,
      estado: { $in: [Estado.HABILITADO, Estado.DESHABILITADO] },
    });

    const integranteIds = integrantes.map((i) => i._id);

    // todos los mensajes de los integrantes
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
    // Obtener todos los integrantes del chat (habilitados y deshabilitados)
    // para considerar mensajes de miembros eliminados en el último mensaje
    const integrantes = await this.integranteRepository.findAll({
      id_chat,
      estado: { $in: [Estado.HABILITADO, Estado.DESHABILITADO] },
    });

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
