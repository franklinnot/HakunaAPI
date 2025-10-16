import { Inject, Injectable } from '@nestjs/common';
import type { IUsuarioRepository } from '../../infraestructure/usuarios.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from '../usuarios.responses';
import { UsuariosMapper } from '../usuarios.mapper';
import type { IArchivosService } from 'src/modules/archivos/application/archivos.service.interface';

@Injectable()
export class EliminarFotoPerfil {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IArchivosService')
    private readonly archivosService: IArchivosService,
  ) {}

  async execute(id: string): Promise<IRespuesta<IUsuarioResponse>> {
    const usuario = await this.usuarioRepository.findById(id);

    if (!usuario) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no existe.',
      });
    } else if (!usuario.id_foto) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no tiene foto de perfil.',
      });
    }

    const result_delete = await this.archivosService.eliminarImagen(
      usuario.id_foto,
    );
    if (!result_delete.success) {
      return crearRespuesta({
        success: false,
        error: 'No se pudo eliminar la foto de perfil.',
      });
    }

    const user_actualizado = await this.usuarioRepository.update(id, {
      id_foto: null,
    });

    if (!user_actualizado) {
      return crearRespuesta({
        success: false,
        error: 'No se pudo eliminar la foto de perfil.',
      });
    }

    return crearRespuesta({
      success: true,
      data: UsuariosMapper.toUsuarioResponse(user_actualizado),
    });
  }
}
