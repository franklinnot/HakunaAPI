import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IArchivoResponse } from '../archivos.responses';
import type { IArchivoRepository } from '../../infraestructure/repositories.interfaces';
import { StorageService } from '../storage.service';
import { ArchivosMapper } from '../archivos.mapper';
import { TipoArchivo } from 'src/shared/domain/enums';
import { ArchivosUtils } from '../archivos.utils';
import { randomUUID } from 'crypto';
@Injectable()
export class CreateArchivo {
  constructor(
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
    @Inject()
    private readonly storageService: StorageService,
    @Inject()
    private readonly archivosUtils: ArchivosUtils,
  ) {}

  async execute(
    buffer: Buffer,
    mimeType: string,
    tipo_archivo: TipoArchivo,
    extension: string,
    maxSize: number,
    nombre?: string,
  ): Promise<IRespuesta<IArchivoResponse>> {
    try {
      // Validar tamaño máximo
      const sizeMB = this.archivosUtils.obtenerTamañoMB(buffer);
      if (sizeMB > maxSize) {
        return crearRespuesta({
          success: false,
          error: `El tamaño máximo es de ${maxSize}MB.`,
        });
      }

      // Generar fileKey
      const uuid = randomUUID();
      const fileKey = `${tipo_archivo}/${uuid}.${extension}`;

      // Subir al almacenamiento
      const link = await this.storageService.uploadFile(
        fileKey,
        buffer,
        mimeType,
      );

      // Guardar metadata
      const archivo = await this.archivoRepository.create({
        nombre: nombre || null,
        tipo_archivo: tipo_archivo,
        extension: extension,
        filekey: fileKey,
        link: link,
        size: `${sizeMB}MB`,
      });

      return crearRespuesta({
        success: true,
        data: ArchivosMapper.toArchivoResponse(archivo),
      });
    } catch {
      return crearRespuesta({
        success: false,
        error: 'Ocurrió un error al procesar el archivo.',
      });
    }
  }
}
