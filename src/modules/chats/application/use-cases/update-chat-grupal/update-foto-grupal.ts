import { Inject, Injectable } from '@nestjs/common';
import type { IChatRepository } from '../../../infraestructure/chats.repositories.interfaces';
import { IRespuesta } from 'src/shared/application/response';
import type { IArchivosService } from 'src/modules/archivos/application/archivos.service.interface';
import { IArchivoResponse } from 'src/modules/archivos/application/archivos.responses';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';

@Injectable()
export class UpdateFotoGrupal {
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
    id_foto_existente?: string | null,
  ): Promise<string | null> {
    let new_link: string | null = null;
    let archivoResponse: IRespuesta<IArchivoResponse> | null = null;

    const id_foto = id_foto_existente
      ? id_foto_existente
      : (await this.chatRepository.findById(id_chat))?.id_foto;

    const oldlink_foto = await this.archivoRepository.findLinkById(
      id_foto || '',
    );

    if (!id_foto) {
      // no tiene foto y llega foto => guardar nueva foto
      if (!oldlink_foto && foto) {
        archivoResponse = await this.archivosService.saveImagen(foto);
        new_link = archivoResponse.data?.link || null;
        await this.chatRepository.update(id_chat, {
          id_foto: archivoResponse.data?.id_archivo || null,
        });
      }
      // no tiene foto y no llega foto => nada
    } else {
      // tiene foto y no llega foto => eliminar foto
      if (oldlink_foto && !foto) {
        await this.archivosService.deleteArchivo(id_foto);
        await this.chatRepository.update(id_chat, {
          id_foto: null,
        });
      }
      // tiene foto y llega foto => eliminar foto anterior y guardar la nueva
      else if (oldlink_foto && foto) {
        archivoResponse = await this.archivosService.updateImagen(
          id_foto,
          foto,
        );
        new_link = archivoResponse.data?.link || null;
      }
    }

    return new_link;
  }
}
