import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IArchivoResponse } from '../archivos.responses';
import type { IArchivoRepository } from '../../infraestructure/repositories.interfaces';
import { StorageService } from '../storage.service';
import { ArchivosUtils } from '../archivos.utils';
import { TipoArchivo } from 'src/shared/domain/enums';
import { randomUUID } from 'crypto';
import { ArchivosMapper } from '../archivos.mapper';

@Injectable()
export class SaveImagen {
  constructor(
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
    @Inject()
    private readonly storageService: StorageService,
    @Inject()
    private readonly archivosUtils: ArchivosUtils,
  ) {}

  async execute(
    base64: string,
    nombre?: string,
  ): Promise<IRespuesta<IArchivoResponse>> {
    const maxSize = 4;
    const extension = 'webp';

    // convertir a .webp
    const webpBuffer = await this.archivosUtils.getImageBuffer(base64);

    if (!webpBuffer) {
      return crearRespuesta({
        success: false,
        error: 'El imagen no es válida.',
      });
    }

    // validar tamaño (máximo 4MB)
    const sizeMB = this.archivosUtils.obtenerTamañoMB(webpBuffer);
    if (sizeMB > maxSize) {
      return crearRespuesta<IArchivoResponse>({
        success: false,
        error: `El tamaño máximo para imágenes es de ${maxSize}MB.`,
      });
    }

    // generar fileKey
    const uuid = randomUUID();
    const fileKey = `${TipoArchivo.IMAGEN}/${uuid}.${extension}`;

    // subir a Cloudflare
    const link = await this.storageService.uploadFile(
      fileKey,
      webpBuffer,
      `image/${extension}`,
    );

    // guardar metadata
    const archivo = await this.archivoRepository.create({
      nombre: nombre,
      tipo_archivo: TipoArchivo.IMAGEN,
      extension: `.${extension}`,
      filekey: fileKey,
      link: link,
      size: `${sizeMB}MB`,
    });

    // retornar respuesta
    return crearRespuesta({
      success: true,
      data: ArchivosMapper.toArchivoResponse(archivo),
    });
  }
}
