import { Inject, Injectable } from '@nestjs/common';
import type { IDetalleMensajeRepository } from '../infraestructure/mensajes.repositories.interfaces';
import { IArchivoResponse } from 'src/modules/archivos/application/archivos.responses';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';

@Injectable()
export class MensajesUtils {
  constructor(
    @Inject('IDetalleMensajeRepository')
    private readonly detalleRepository: IDetalleMensajeRepository,
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
  ) {}

  async obtenerDetalles(id_mensaje: string): Promise<IArchivoResponse[]> {
    const detalles = await this.detalleRepository.findAll({
      id_mensaje: id_mensaje,
    });

    const archivos: IArchivoResponse[] = [];
    for (const detalle of detalles) {
      const archivo = await this.archivoRepository.findById(detalle.id_archivo);
      if (!archivo) continue;

      const archivoResponse: IArchivoResponse = {
        id_archivo: archivo._id,
        nombre: archivo.nombre,
        link: archivo.link,
        tipo_archivo: archivo.tipo_archivo,
        estado: archivo.estado,
        extension: archivo.extension,
      };
      archivos.push(archivoResponse);
    }
    return archivos;
  }
}
