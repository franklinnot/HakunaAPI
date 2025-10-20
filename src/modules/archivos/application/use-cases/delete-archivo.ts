import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IArchivoResponse } from '../archivos.responses';
import type { IArchivoRepository } from '../../infraestructure/repositories.interfaces';
import { StorageService } from '../storage.service';
import { ArchivosMapper } from '../archivos.mapper';

@Injectable()
export class DeleteArchivo {
  constructor(
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
    @Inject()
    private readonly storageService: StorageService,
  ) {}

  async execute(id_archivo: string): Promise<IRespuesta<IArchivoResponse>> {
    let archivo = await this.archivoRepository.findById(id_archivo);

    if (!archivo || !archivo.filekey) {
      return crearRespuesta({
        success: false,
        error: 'La imagen no existe.',
      });
    }

    await this.storageService.deleteFile(archivo.filekey);
    archivo = await this.archivoRepository.update(id_archivo, {
      filekey: null,
      link: null,
    });

    return crearRespuesta({
      success: true,
      data: ArchivosMapper.toArchivoResponse(archivo!),
    });
  }
}
