import { IRespuesta } from 'src/shared/application/response';
import { IArchivoResponse } from './archivos.responses';

export interface IArchivosService {
  // jpg siempre
  guardarImagen(
    base64: string,
    nombre: string | null,
  ): Promise<IRespuesta<IArchivoResponse>>;
  actualizarImagen(
    id_archivo: string,
    base64: string,
    nombre: string | null,
  ): Promise<IRespuesta<IArchivoResponse>>;
  eliminarImagen(id_archivo: string): Promise<IRespuesta<IArchivoResponse>>;
  // siempre mp4
  guardarVideo(
    base64: string,
    nombre: string | null,
  ): Promise<IRespuesta<IArchivoResponse>>;
  // excel, word, powerpoint, zip, pdf, zip, etc
  guardarDocumento(
    nombre: string | null,
    extension: string,
    size: string,
  ): Promise<IRespuesta<IArchivoResponse>>;
  // siempre mp3
  guardarAudio(
    base64: string,
    nombre: string | null,
  ): Promise<IRespuesta<IArchivoResponse>>;
}
