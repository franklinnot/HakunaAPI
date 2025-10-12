import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IViewer } from '../../domain/mensajes.entities';
import { BaseRepository } from 'src/shared/infraestructure/repository/base.repository';
import { Viewer } from '../schemas/viewer.schema';
import { Estado } from 'src/shared/domain/enums';
import { IViewerRepository } from '../mensajes.repositories.interfaces';
import { Persistence } from '../../../../shared/infraestructure/infraestructure.types';

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

  protected toPersistence(entity: Partial<IViewer>): Persistence<IViewer> {
    return {
      estado: entity.estado,
      id_integrante: entity.id_integrante,
      id_mensaje: entity.id_mensaje,
      visto: entity.visto,
    } as Persistence<IViewer>;
  }

  protected toDomain(doc: Viewer): IViewer {
    return {
      _id: doc._id ?? '',
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
      estado: doc.estado ?? Estado.HABILITADO,
      //
      id_integrante: doc.id_integrante ?? null,
      id_mensaje: doc.id_mensaje ?? null,
      visto: doc.visto ?? false,
    };
  }

  registerViewers(
    id_mensaje: string,
    ids_integrantes: string[],
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
