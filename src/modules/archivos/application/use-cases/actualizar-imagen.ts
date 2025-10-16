import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IArchivoResponse } from '../archivos.responses';
import type { IArchivoRepository } from '../../infraestructure/repositories.interfaces';
import { EliminarImagen } from './eliminar-imagen';
import { GuardarImagen } from './guardar-imagen';

@Injectable()
export class ActualizarImagen {
  constructor(
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
    private readonly guardarImagen: GuardarImagen,
    private readonly eliminarImagenService: EliminarImagen,
  ) {}

  async execute(
    id_archivo: string,
    base64: string,
    nombre: string | null,
  ): Promise<IRespuesta<IArchivoResponse>> {
    const existe = await this.archivoRepository.existsById(id_archivo);

    if (!existe) {
      return crearRespuesta({
        success: false,
        error: 'La imagen no existe.',
      });
    }

    await this.eliminarImagenService.execute(id_archivo);
    const archivoResponse = await this.guardarImagen.execute(base64, nombre);

    // retornar respuesta
    return crearRespuesta({
      success: archivoResponse.success,
      data: archivoResponse.data,
      error: archivoResponse.error,
    });
  }
}
