import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IArchivoResponse } from '../archivos.responses';
import type { IArchivoRepository } from '../../infraestructure/repositories.interfaces';
import { StorageService } from '../storage.service';
import { ArchivosUtils } from '../archivos.utils';
import { TipoArchivo } from 'src/shared/domain/enums';
import { randomUUID } from 'crypto';
import { ArchivosMapper } from '../archivos.mapper';
const FileType = require('file-type'); 

@Injectable()
export class SaveDocumento {
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
    // Decodificar base64 a Buffer
    const buffer = this.archivosUtils.base64ToBuffer(base64);
    if (!buffer) {
      return crearRespuesta({
        success: false,
        error: 'El archivo no es un base64 válido.',
      });
    }

    // Detectar tipo y extensión
    const tipo = await FileType.fromBuffer(buffer);
    const mimeType = tipo?.mime || 'application/octet-stream';
    const extension = tipo?.ext ? `.${tipo.ext}` : '';

    // Validar tipos permitidos para documentos
    const allowedDocs = new Set([
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
    ]);

    if (!allowedDocs.has(mimeType)) {
      return crearRespuesta<IArchivoResponse>({
        success: false,
        error: 'El tipo de documento no es soportado.',
      });
    }

    // Tamaño en MB
    const sizeMB = this.archivosUtils.obtenerTamañoMB(buffer);

    // Generar fileKey
    const uuid = randomUUID();
    const fileKey = `${TipoArchivo.DOCUMENTO}/${uuid}${extension}`;

    // Subir al almacenamiento
    const link = await this.storageService.uploadFile(
      fileKey,
      buffer,
      mimeType,
    );

    // Guardar metadata
    const archivo = await this.archivoRepository.create({
      nombre: nombre || null,
      tipo_archivo: TipoArchivo.DOCUMENTO,
      extension: extension || '',
      filekey: fileKey,
      link: link,
      size: `${sizeMB}MB`,
    });

    return crearRespuesta({
      success: true,
      data: ArchivosMapper.toArchivoResponse(archivo),
    });
  }
}
