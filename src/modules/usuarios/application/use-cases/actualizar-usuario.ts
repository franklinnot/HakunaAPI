import { Inject, Injectable } from '@nestjs/common';
import type { IUsuarioRepository } from '../../infraestructure/usuarios.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from '../usuarios.responses';
import { UsuariosMapper } from '../usuarios.mapper';
import { ActualizarFotoPerfil } from './actualizar-foto-perfil';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';

@Injectable()
export class ActualizarUsuario {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly actualizarFotoPerfilService: ActualizarFotoPerfil,
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
  ) {}

  async execute(
    id: string,
    foto: string | null | undefined,
    nombre: string | null | undefined,
    username: string | null | undefined,
  ): Promise<IRespuesta<IUsuarioResponse>> {
    const usuario = await this.usuarioRepository.findById(id);

    if (!usuario) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no existe.',
      });
    }

    if (nombre && nombre.length < 2) {
      return crearRespuesta({
        success: false,
        error: 'El nombre no es válido.',
      });
    }

    // si se incluye username
    if (username) {
      if (username.length < 2) {
        return crearRespuesta({
          success: false,
          error: 'El username no es válido.',
        });
      }
      const user = await this.usuarioRepository.findOne({
        username: username,
      });
      if (user && user._id != id) {
        return crearRespuesta({
          success: false,
          error: 'El username ya existe.',
        });
      }
    }

    let new_link: string | null = null;
    // si se pide cambio
    if (typeof foto !== 'undefined') {
      new_link = await this.actualizarFotoPerfilService.execute(usuario, foto);
    } else {
      // no se pidió cambio: obtener link actual
      new_link = await this.archivoRepository.findLinkById(
        usuario.id_foto || '',
      );
    }

    const user_actualizado = await this.usuarioRepository.update(id, {
      nombre: nombre || usuario.nombre,
      username: username || usuario.username,
    });

    return crearRespuesta({
      success: true,
      data: UsuariosMapper.toUsuarioResponse(
        user_actualizado!,
        new_link ?? null,
      ),
    });
  }
}
