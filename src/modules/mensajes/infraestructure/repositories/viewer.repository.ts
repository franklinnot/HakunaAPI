import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IViewer } from '../../domain/mensajes.entities';
import { BaseRepository } from 'src/shared/infraestructure/repository/base.repository';
import { Viewer } from '../schemas/viewer.schema';
import { Estado } from 'src/shared/domain/enums';
import { IViewerRepository } from '../mensajes.repositories.interfaces';

@Injectable()
export class ViewerRepository
  extends BaseRepository<IViewer, Viewer>
  implements IViewerRepository
{
  constructor(
    @InjectModel(Viewer.name)
    private readonly viewerModel: Model<Viewer>,
  ) {
    super(viewerModel);
  }

  protected toDomain(doc: Viewer): IViewer {
    return {
      _id: doc._id || '',
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
      estado: doc.estado || Estado.HABILITADO,
      //
      id_integrante: doc.id_integrante || '',
      id_mensaje: doc.id_mensaje || '',
      visto: doc.visto || false,
    };
  }

  registrarViewers(
    id_mensaje: string,
    integrantes: { id_integrante: string; visto: boolean }[],
  ): Promise<IViewer[]> {
    const viewers = integrantes.map((i) => {
      return this.create({
        id_mensaje: id_mensaje,
        id_integrante: i.id_integrante,
        visto: i.visto,
      });
    });
    return Promise.all(viewers);
  }
}
