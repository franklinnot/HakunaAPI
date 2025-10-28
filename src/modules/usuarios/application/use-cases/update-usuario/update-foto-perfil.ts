import { Inject, Injectable } from '@nestjs/common';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import { IRespuesta } from 'src/shared/application/response';
import type { IArchivosService } from 'src/modules/archivos/application/archivos.service.interface';
import { IArchivoResponse } from 'src/modules/archivos/application/archivos.responses';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';

@Injectable()
export class UpdateFotoPerfil {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IArchivosService')
    private readonly archivosService: IArchivosService,
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
  ) {}

  async execute(
    id_usuario: string,
    foto: string | null,
  ): Promise<string | null> {
    let new_link: string | null = null;
    let archivoResponse: IRespuesta<IArchivoResponse> | null = null;

    const id_foto = (await this.usuarioRepository.findById(id_usuario))
      ?.id_foto;

    const oldlink_foto = await this.archivoRepository.findLinkById(
      id_foto || '',
    );

    // no tiene foto
    if (!oldlink_foto) {
      // y llega foto => guardar nueva fotop
      if (foto) {
        archivoResponse = await this.archivosService.saveImagen(foto);
        new_link = archivoResponse.data?.link || null;
        await this.usuarioRepository.update(id_usuario, {
          id_foto: archivoResponse.data?.id_archivo || null,
        });
      }
      //y no llega foto => nada xd
    }
    // tiene foto
    else {
      // y no llega foto => eliminar fotop
      if (!foto) {
        await this.archivosService.deleteArchivo(id_foto!);
        await this.usuarioRepository.update(id_usuario, {
          id_foto: null,
        });
      }
      // y llega foto => eliminar foto anterior y guardar la nuevap
      else if (foto) {
        archivoResponse = await this.archivosService.updateImagen(
          id_foto!,
          foto,
        );
        await this.usuarioRepository.update(id_usuario, {
          id_foto: archivoResponse.data?.id_archivo || null,
        });
        new_link = archivoResponse.data?.link || null;
      }
    }

    return new_link;
  }
}
