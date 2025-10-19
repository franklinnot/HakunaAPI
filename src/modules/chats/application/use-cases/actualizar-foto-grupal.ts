import { Inject, Injectable } from '@nestjs/common';
import type { IChatRepository } from '../../infraestructure/chats.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import type { IArchivosService } from 'src/modules/archivos/application/archivos.service.interface';
import { IArchivoResponse } from 'src/modules/archivos/application/archivos.responses';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';

@Injectable()
export class ActualizarFotoGrupal {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject('IArchivosService')
    private readonly archivosService: IArchivosService,
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
  ) {}

  async execute(
    id_chat: string,
    foto: string | null,
  ): Promise<IRespuesta<string | null>> {
    try {
      // Obtener el chat actual
      const chat = await this.chatRepository.findById(id_chat);
      if (!chat) {
        return crearRespuesta({
          success: false,
          error: 'Chat no encontrado',
        });
      }

      let new_id_archivo: string | null = null;
      let archivoResponse: IRespuesta<IArchivoResponse> | null = null;
      const oldlink_foto = await this.archivoRepository.findLinkById(
        chat.id_foto || '',
      );

      // no tiene foto y llega foto => guardar nueva foto
      if (!oldlink_foto && foto) {
        archivoResponse = await this.archivosService.guardarImagen(foto, null);
        new_id_archivo = archivoResponse.data?.id_archivo || null;
        await this.chatRepository.update(id_chat, {
          id_foto: new_id_archivo,
        });
      }
      // tiene foto y no llega foto => eliminar foto
      else if (oldlink_foto && !foto) {
        await this.archivosService.eliminarArchivo(chat.id_foto!);
        await this.chatRepository.update(id_chat, {
          id_foto: null,
        });
        new_id_archivo = null;
      }
      // tiene foto y llega foto => eliminar foto anterior y guardar la nueva
      else if (oldlink_foto && foto) {
        archivoResponse = await this.archivosService.actualizarImagen(
          chat.id_foto!,
          foto,
          null,
        );
        new_id_archivo = archivoResponse.data?.id_archivo || null;
      }
      // no tiene foto y no llega foto => nada
      else {
        new_id_archivo = chat.id_foto;
      }

      return crearRespuesta({
        success: true,
        data: new_id_archivo,
      });
    } catch (error) {
      return crearRespuesta({
        success: false,
        error: 'Error al procesar la foto del grupo',
      });
    }
  }

  // Método para procesar foto sin necesidad de un chat existente (para crear-chat-grupal)
  async procesarFoto(foto: string): Promise<IRespuesta<string | null>> {
    try {
      const archivoResponse = await this.archivosService.guardarImagen(foto, null);
      return crearRespuesta({
        success: true,
        data: archivoResponse.data?.id_archivo || null,
      });
    } catch (error) {
      return crearRespuesta({
        success: false,
        error: 'Error al procesar la foto',
      });
    }
  }
}