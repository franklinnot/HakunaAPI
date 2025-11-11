import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IArchivoResponse } from '../archivos.responses';
import { ArchivosUtils } from '../archivos.utils';
import { TipoArchivo } from 'src/shared/domain/enums';
import sharp from 'sharp';
import { CreateArchivo } from './create-archivo';

@Injectable()
export class SaveImagen {
  constructor(
    @Inject()
    private readonly archivosUtils: ArchivosUtils,
    @Inject()
    private readonly createArchivoCU: CreateArchivo,
  ) {}

  private readonly maxSize = 4; // MB
  private readonly extension = 'webp';
  private readonly mimeType = 'image/webp';
  private readonly allowedFormats = [
    'image/webp',
    'image/png',
    'image/jpeg',
    'image/svg+xml',
  ];

  async execute(
    base64: string,
    nombre?: string,
  ): Promise<IRespuesta<IArchivoResponse>> {
    try {
      let buffer = await this.archivosUtils.getBuffer(
        base64,
        this.allowedFormats,
      );

      if (!buffer) {
        return crearRespuesta({
          success: false,
          error: 'La imagen no es válida.',
        });
      }

      buffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();

      return await this.createArchivoCU.execute(
        buffer,
        this.mimeType,
        TipoArchivo.IMAGEN,
        this.extension,
        this.maxSize,
        nombre,
      );
    } catch {
      return crearRespuesta({
        success: false,
        error: 'Error al procesar la imagen',
      });
    }
  }
}
