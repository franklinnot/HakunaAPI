import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DetalleMensaje } from '../schemas/detalle-mensaje.schema';
import { BaseRepository } from 'src/shared/infraestructure/repository/base.repository';
import { IDetalleMensajeRepository } from '../mensajes.repositories.interfaces';
import { IDetalleMensaje } from '../../domain/mensajes.entities';
import { Estado } from 'src/shared/domain/enums';

@Injectable()
export class DetalleMensajeRepository
  extends BaseRepository<IDetalleMensaje, DetalleMensaje>
  implements IDetalleMensajeRepository
{
  constructor(
    @InjectModel(DetalleMensaje.name)
    private readonly detalleMensajeModel: Model<DetalleMensaje>,
  ) {
    super(detalleMensajeModel);
  }

  protected toDomain(doc: DetalleMensaje): IDetalleMensaje {
    return {
      _id: doc._id || '',
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
      estado: doc.estado || Estado.HABILITADO,
      //
      id_archivo: doc.id_archivo || '',
      id_mensaje: doc.id_mensaje || '',
    };
  }

  findByMensaje(id_mensaje: string): Promise<IDetalleMensaje[]> {
    return this.findAll({
      id_mensaje: id_mensaje,
    });
  }

  registrarDetalles(
    detalles: {
      id_mensaje: string;
      id_integrante: string;
    }[],
  ): Promise<IDetalleMensaje[]> {
    const createdDetalles = detalles.map((detalle) => {
      return this.create({
        id_mensaje: detalle.id_mensaje,
        id_archivo: detalle.id_integrante,
      });
    });
    return Promise.all(createdDetalles);
  }
}
