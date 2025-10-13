import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Archivo } from '../schemas/archivo.schema';
import { BaseRepository } from 'src/shared/infraestructure/repository/base.repository';
import type { Persistence } from 'src/shared/infraestructure/infraestructure.types';
import { IArchivo } from '../../domain/archivos.entities';
import { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';
import { Estado, TipoArchivo } from 'src/shared/domain/enums';

@Injectable()
export class ArchivoRepository
  extends BaseRepository<IArchivo, Archivo>
  implements IArchivoRepository
{
  constructor(
    @InjectModel(Archivo.name)
    private readonly archivoModel: Model<Archivo>,
  ) {
    super(archivoModel);
  }

  protected toDomain(doc: Archivo): IArchivo {
    return {
      _id: doc._id ?? '',
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
      //
      estado: doc.estado ?? Estado.HABILITADO,
      nombre: doc.nombre ?? '',
      link: doc.link ?? '',
      tipo_archivo: doc.tipo_archivo ?? TipoArchivo.DOCUMENTO,
      extension: doc.extension ?? '',
      size: doc.size ?? '',
      filekey: doc.filekey ?? '',
    };
  }

  protected toPersistence(entity: Partial<IArchivo>) {
    return {
      estado: entity.estado,
      nombre: entity.nombre,
      link: entity.link,
      tipo_archivo: entity.tipo_archivo,
      extension: entity.extension,
      size: entity.size,
      filekey: entity.filekey,
    } as Persistence<IArchivo>;
  }

  findByLink(link: string): Promise<IArchivo | null> {
    return this.findOne({ link });
  }
}
