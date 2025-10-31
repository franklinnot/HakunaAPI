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
export class SaveAudio {
  constructor(
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
    @Inject()
    private readonly storageService: StorageService,
    @Inject()
    private readonly archivosUtils: ArchivosUtils,
  ) {}

  private readonly maxSize = 8; // MB
  private readonly extension = 'mp3';
  private readonly allowedAudioFormats = [
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
    // obtener buffer del audio
    const audioBuffer = await this.getAudioBuffer(base64);

    if (!audioBuffer) {
      return crearRespuesta({
        success: false,
        error: 'El audio no es válido.',
      });
    }

    // validar tamaño
    const sizeMB = this.archivosUtils.obtenerTamañoMB(audioBuffer);
    if (sizeMB > this.maxSize) {
      return crearRespuesta<IArchivoResponse>({
        success: false,
        error: `El tamaño máximo para audios es de ${this.maxSize}MB.`,
      });
    }

    // generar fileKey
    const uuid = randomUUID();
    const fileKey = `${TipoArchivo.AUDIO}/${uuid}.${this.extension}`;
    // subir a Cloudflare
    const link = await this.storageService.uploadFile(
      fileKey,
      audioBuffer,
      `audio/${this.extension}`,
    );

    // guardar metadata
    const archivo = await this.archivoRepository.create({
      nombre: nombre,
      tipo_archivo: TipoArchivo.AUDIO,
      extension: `.${this.extension}`,
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

  async getAudioBuffer(base64: string): Promise<Buffer | null> {
    const mimeType = await this.archivosUtils.getMimeType(base64);

    if (!mimeType || !this.allowedAudioFormats.includes(mimeType)) {
      return null;
    }

    const buffer = this.archivosUtils.base64ToBuffer(base64);
    return buffer || null;
  }
}
