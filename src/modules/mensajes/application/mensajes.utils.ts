import { Inject, Injectable } from '@nestjs/common';
import type {
  IDetalleMensajeRepository,
  IMensajeRepository,
} from '../infraestructure/mensajes.repositories.interfaces';
import { IArchivoResponse } from 'src/modules/archivos/application/archivos.responses';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';
import { IMensajeResponse } from './mensajes.responses';
import type { IIntegranteRepository } from 'src/modules/chats/infraestructure/chats.repositories.interfaces';

@Injectable()
export class MensajesUtils {
  constructor(
    @Inject('IDetalleMensajeRepository')
    private readonly detalleRepository: IDetalleMensajeRepository,
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
    @Inject('IMensajeRepository')
    private readonly mensajeRepository: IMensajeRepository,
    @Inject('IIntegranteRepository')
    private readonly integranteRepository: IIntegranteRepository,
  ) {}

  async obtenerDetalles(id_mensaje: string): Promise<IArchivoResponse[]> {
    const detalles = await this.detalleRepository.findAll({
      id_mensaje: id_mensaje,
    });

    const archivos: IArchivoResponse[] = [];
    for (const detalle of detalles) {
      const archivo = await this.archivoRepository.findById(detalle.id_archivo);
      if (!archivo) continue;

      const archivoResponse: IArchivoResponse = {
        id_archivo: archivo._id,
        nombre: archivo.nombre,
        link: archivo.link,
        tipo_archivo: archivo.tipo_archivo,
        estado: archivo.estado,
        extension: archivo.extension,
        size: archivo.size,
      };
      archivos.push(archivoResponse);
    }
    return archivos;
  }

  async getUltimoMensaje(id_chat: string): Promise<IMensajeResponse | null> {
    // Obtener todos los mensajes del chat
    const ultimo_mensaje =
      await this.mensajeRepository.findUltimoMensajeByChatId(id_chat);

    if (!ultimo_mensaje) {
      return null;
    }

    const integranteEmisor = await this.integranteRepository.findById(
      ultimo_mensaje.id_integrante,
    );

    // Obtener archivos asociados (si existen)
    const archivos = await this.obtenerDetalles(ultimo_mensaje._id);

    return {
      id_mensaje: ultimo_mensaje._id,
      id_usuario: integranteEmisor!.id_usuario,
      id_chat: id_chat,
      is_group: false,
      descripcion: ultimo_mensaje.descripcion,
      has_files: ultimo_mensaje.has_files,
      createdAt: ultimo_mensaje.createdAt,
      archivos: archivos,
      estado: ultimo_mensaje.estado,
    };
  }
}
