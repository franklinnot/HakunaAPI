import { Inject, Injectable } from '@nestjs/common';
import type { IUsuarioRepository } from '../../infraestructure/usuarios.repositories.interfaces';
import { IRespuesta } from 'src/shared/application/response';
import type { IArchivosService } from 'src/modules/archivos/application/archivos.service.interface';
import { IArchivoResponse } from 'src/modules/archivos/application/archivos.responses';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';
import { IUsuario } from '../../domain/usuarios.entities';

@Injectable()
export class ActualizarFotoPerfil {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IArchivosService')
    private readonly archivosService: IArchivosService,
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
  ) {}

  async execute(
    usuario: IUsuario,
    foto: string | null,
  ): Promise<string | null> {
    const id_usuario = usuario._id;
    let new_link: string | null = null;
    let archivoResponse: IRespuesta<IArchivoResponse> | null = null;
    const oldlink_foto = await this.archivoRepository.findLinkById(
      usuario.id_foto || '',
    );

    // no tiene foto y llega foto => guardar nueva fotop
    if (!oldlink_foto && foto) {
      archivoResponse = await this.archivosService.guardarImagen(foto, null);
      new_link = archivoResponse.data?.link || null;
      await this.usuarioRepository.update(id_usuario, {
        id_foto: archivoResponse.data?.id_archivo || null,
      });
    }
    // tiene foto y no llega foto => eliminar fotop
    else if (oldlink_foto && !foto) {
      await this.archivosService.eliminarArchivo(usuario.id_foto!);
    }
    // tiene foto y llega foto => eliminar foto anterior y guardar la nuevap
    else if (oldlink_foto && foto) {
      archivoResponse = await this.archivosService.actualizarImagen(
        usuario.id_foto!,
        foto,
        null,
      );
      new_link = archivoResponse.data?.link || null;
    }
    // no tiene foto y no llega foto => nada xd

    return new_link;
  }
}
