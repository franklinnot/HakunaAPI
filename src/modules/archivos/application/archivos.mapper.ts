import { IArchivo } from '../domain/archivos.entities';
import { IArchivoResponse } from './archivos.responses';

export class ArchivosMapper {
  static toArchivoResponse(archivo: IArchivo): IArchivoResponse {
    return {
      id_archivo: archivo._id,
      nombre: archivo.nombre,
      link: archivo.link,
      tipo_archivo: archivo.tipo_archivo,
      extension: archivo.extension,
      size: archivo.size,
      estado: archivo.estado,
    };
  }
}
