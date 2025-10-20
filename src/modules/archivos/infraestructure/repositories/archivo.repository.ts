import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Archivo } from '../schemas/archivo.schema';
import { BaseRepository } from 'src/shared/infraestructure/repository/base.repository';
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
      _id: doc._id || '',
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
      estado: doc.estado || Estado.HABILITADO,
      //
      nombre: doc.nombre || null,
      link: doc.link || null,
      tipo_archivo: doc.tipo_archivo || TipoArchivo.DOCUMENTO,
      extension: doc.extension ?? null,
      size: doc.size || '',
      filekey: doc.filekey || null,
    };
  }

  async findLinkById(id_archivo: string): Promise<string | null> {
    const archivo = await this.findOne({ _id: id_archivo });
    return archivo?.link ?? null;
  }
}
