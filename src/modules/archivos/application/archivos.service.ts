import { Injectable } from '@nestjs/common';
import { IArchivosService } from './archivos.service.interface';
import { IRespuesta } from 'src/shared/application/response';
import { IArchivoResponse } from './archivos.responses';
import { GuardarImagen } from './use-cases/guardar-imagen';

// hakuna-api-files

@Injectable()
export class ArchivosService implements IArchivosService {
  constructor(private readonly guardarImagenService: GuardarImagen) {}

  async guardarImagen(
    base64: string,
    nombre: string | null,
  ): Promise<IRespuesta<IArchivoResponse>> {
    return await this.guardarImagenService.execute(base64, nombre);
  }

  guardarVideo(
    base64: string,
    nombre: string | null,
  ): Promise<IRespuesta<IArchivoResponse>> {
    throw new Error('Method not implemented.');
  }

  guardarDocumento(
    nombre: string | null,
    extension: string,
    size: string,
  ): Promise<IRespuesta<IArchivoResponse>> {
    throw new Error('Method not implemented.');
  }

  guardarAudio(
    base64: string,
    nombre: string | null,
  ): Promise<IRespuesta<IArchivoResponse>> {
    throw new Error('Method not implemented.');
  }
}
