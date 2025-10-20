import { Inject, Injectable } from '@nestjs/common';
import type { IUsuarioRepository } from '../../../infraestructure/usuarios.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from '../../usuarios.responses';
import { UsuariosMapper } from '../../usuarios.mapper';
import { UpdateFotoPerfil } from './update-foto-perfil';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';
import { IUsuario } from '../../../domain/usuarios.entities';
import { Estado } from 'src/shared/domain/enums';

@Injectable()
export class UpdateUsuario {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
    @Inject()
    private readonly updateFotoPerfilCU: UpdateFotoPerfil,
  ) {}

  async execute(
    usuario: IUsuario,
    nombre?: string,
    username?: string,
    foto?: string | null,
  ): Promise<IRespuesta<IUsuarioResponse>> {
    const id_usuario = usuario._id;

    // si se incluye username
    if (username) {
      const user = await this.usuarioRepository.findOne({
        username: username.toLowerCase(),
        estado: Estado.HABILITADO,
      });
      if (user && user._id != id_usuario) {
        return crearRespuesta({
          success: false,
          error: 'El usuario ya existe.',
        });
      }
    }

    let new_link: string | null = null;
    // si se pide cambio
    if (foto !== undefined) {
      new_link = await this.updateFotoPerfilCU.execute(id_usuario, foto);
    } else {
      // no se pidió cambio: obtener link actual
      new_link = usuario.id_foto
        ? await this.archivoRepository.findLinkById(usuario.id_foto)
        : null;
    }

    const user_actualizado = await this.usuarioRepository.update(id_usuario, {
      nombre: nombre || usuario.nombre,
      username: username?.toLowerCase() || usuario.username,
    });

    if (!user_actualizado) {
      return crearRespuesta({
        success: false,
        error: 'No se pudo actualizar el usuario.',
      });
    }

    return crearRespuesta({
      success: true,
      data: UsuariosMapper.toUsuarioResponse(
        user_actualizado,
        new_link ?? null,
      ),
    });
  }
}
