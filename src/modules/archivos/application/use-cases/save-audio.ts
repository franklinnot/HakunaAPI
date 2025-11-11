import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IArchivoResponse } from '../archivos.responses';
import { ArchivosUtils } from '../archivos.utils';
import { TipoArchivo } from 'src/shared/domain/enums';
import { CreateArchivo } from './create-archivo';

@Injectable()
export class SaveAudio {
  constructor(
    @Inject()
    private readonly archivosUtils: ArchivosUtils,
    @Inject()
    private readonly createArchivoCU: CreateArchivo,
  ) {}

  private readonly maxSize = 8; // MB
  private readonly extension = 'mp3';
  private readonly mimeType = 'audio/mpeg';
  private readonly allowedFormats = [
    'audio/mpeg',
    'audio/wav',
    'audio/aac',
    'audio/webm',
    'video/webm',
  ];

  async execute(
    base64: string,
    nombre?: string,
  ): Promise<IRespuesta<IArchivoResponse>> {
    try {
      const buffer = await this.archivosUtils.getBuffer(
        base64,
        this.allowedFormats,
      );
      if (!buffer) {
        return crearRespuesta({
          success: false,
          error: 'El audio no es válido o su formato no está permitido.',
        });
      }

      return await this.createArchivoCU.execute(
        buffer,
        this.mimeType,
        TipoArchivo.AUDIO,
        this.extension,
        this.maxSize,
        nombre,
      );
    } catch {
      return crearRespuesta({
        success: false,
        error: 'Error al procesar el audio',
      });
    }
  }
}
