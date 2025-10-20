import { Inject, Injectable } from '@nestjs/common';
import { IArchivosService } from './archivos.service.interface';
import { IRespuesta } from 'src/shared/application/response';
import { IArchivoResponse } from './archivos.responses';
import { SaveImagen } from './use-cases/save-imagen';
import { UpdateImagen } from './use-cases/update-imagen';
import { DeleteArchivo } from './use-cases/delete-archivo';

// hakuna-api-files

@Injectable()
export class ArchivosService implements IArchivosService {
  constructor(
    @Inject()
    private readonly saveImagenCU: SaveImagen,
    @Inject()
    private readonly updateImagenCU: UpdateImagen,
    @Inject()
    private readonly deleteArchivoCU: DeleteArchivo,
  ) {}

  async saveImagen(
    base64: string,
    nombre?: string,
  ): Promise<IRespuesta<IArchivoResponse>> {
    return await this.saveImagenCU.execute(base64, nombre);
  }

  async updateImagen(
    id_archivo: string,
    base64: string,
    nombre?: string,
  ): Promise<IRespuesta<IArchivoResponse>> {
    return await this.updateImagenCU.execute(id_archivo, base64, nombre);
  }

  async deleteArchivo(
    id_archivo: string,
  ): Promise<IRespuesta<IArchivoResponse>> {
    return await this.deleteArchivoCU.execute(id_archivo);
  }

  saveVideo(
    base64: string,
    nombre?: string,
  ): Promise<IRespuesta<IArchivoResponse>> {
    throw new Error('Method not implemented.');
  }

  saveDocumento(
    extension: string,
    nombre?: string,
  ): Promise<IRespuesta<IArchivoResponse>> {
    throw new Error('Method not implemented.');
  }

  saveAudio(
    base64: string,
    nombre?: string,
  ): Promise<IRespuesta<IArchivoResponse>> {
    throw new Error('Method not implemented.');
  }
}
