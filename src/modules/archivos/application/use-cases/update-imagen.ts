import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IArchivoResponse } from '../archivos.responses';
import type { IArchivoRepository } from '../../infraestructure/repositories.interfaces';
import { DeleteArchivo } from './delete-archivo';
import { SaveImagen } from './save-imagen';

@Injectable()
export class UpdateImagen {
  constructor(
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
    @Inject()
    private readonly guardarImagen: SaveImagen,
    @Inject()
    private readonly eliminarArchivoService: DeleteArchivo,
  ) {}

  async execute(
    id_archivo: string,
    base64: string,
    nombre?: string,
  ): Promise<IRespuesta<IArchivoResponse>> {
    const existe = await this.archivoRepository.existsById(id_archivo);

    if (!existe) {
      return crearRespuesta({
        success: false,
        error: 'La imagen no existe.',
      });
    }

    await this.eliminarArchivoService.execute(id_archivo);
    const archivoResponse = await this.guardarImagen.execute(base64, nombre);

    // retornar respuesta
    return crearRespuesta({
      success: archivoResponse.success,
      data: archivoResponse.data,
      error: archivoResponse.error,
    });
  }
}
