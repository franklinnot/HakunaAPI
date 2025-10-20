import { IRespuesta } from 'src/shared/application/response';
import { IArchivoResponse } from './archivos.responses';

export interface IArchivosService {
  // jpg siempre
  saveImagen(
    base64: string,
    nombre?: string,
  ): Promise<IRespuesta<IArchivoResponse>>;
  updateImagen(
    id_archivo: string,
    base64: string,
    nombre?: string,
  ): Promise<IRespuesta<IArchivoResponse>>;
  deleteArchivo(id_archivo: string): Promise<IRespuesta<IArchivoResponse>>;
  // siempre mp4
  saveVideo(
    base64: string,
    nombre?: string,
  ): Promise<IRespuesta<IArchivoResponse>>;
  // excel, word, powerpoint, zip, pdf, zip, etc
  saveDocumento(
    extension: string,
    nombre?: string,
  ): Promise<IRespuesta<IArchivoResponse>>;
  // siempre mp3
  saveAudio(
    base64: string,
    nombre?: string,
  ): Promise<IRespuesta<IArchivoResponse>>;
}
