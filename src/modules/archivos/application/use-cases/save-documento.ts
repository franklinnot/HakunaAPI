import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IArchivoResponse } from '../archivos.responses';
import { ArchivosUtils } from '../archivos.utils';
import { TipoArchivo } from 'src/shared/domain/enums';
import { fileTypeFromBuffer } from 'file-type';
import { CreateArchivo } from './create-archivo';

@Injectable()
export class SaveDocumento {
  constructor(
    @Inject()
    private readonly archivosUtils: ArchivosUtils,
    @Inject()
    private readonly createArchivoCU: CreateArchivo,
  ) {}

  private readonly maxSize = 8; // MB
  private readonly allowedFormats = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
    'application/octet-stream', // fallback
  ];

  async execute(
    base64: string,
    nombre?: string,
  ): Promise<IRespuesta<IArchivoResponse>> {
    try {
      const buffer = this.archivosUtils.base64ToBuffer(base64);
      if (!buffer) {
        return crearRespuesta({
          success: false,
          error: 'El archivo no es válido o está corrupto.',
        });
      }

      const fileType = await fileTypeFromBuffer(buffer);
      const mimeType = fileType?.mime || 'application/octet-stream';
      const extension = fileType?.ext || 'bin';

      if (
        !this.allowedFormats.includes(mimeType) &&
        mimeType !== 'application/octet-stream'
      ) {
        return crearRespuesta({
          success: false,
          error: `El tipo de archivo (${extension || mimeType}) no está permitido.`,
        });
      }

      return await this.createArchivoCU.execute(
        buffer,
        mimeType,
        TipoArchivo.DOCUMENTO,
        extension,
        this.maxSize,
        nombre,
      );
    } catch {
      return crearRespuesta({
        success: false,
        error: 'Error al procesar el documento',
      });
    }
  }
}
