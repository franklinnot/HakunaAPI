import { Inject, Injectable } from '@nestjs/common';
import type { IUsuarioRepository } from '../../infraestructure/usuarios.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from '../usuarios.responses';
import { UsuariosMapper } from '../usuarios.mapper';

@Injectable()
export class ActualizarUsuario {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(
    id: string,
    foto: string,
    nombre: string,
    username: string,
    password: string,
  ): Promise<IRespuesta<IUsuarioResponse>> {
    const existe = await this.usuarioRepository.existsById(id);

    if (!existe) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no existe.',
      });
    }

    // si se incluye username
    if (username) {
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

    const user_actualizado = await this.usuarioRepository.update(id, {
      id_foto: foto,
      nombre,
      username,
      password,
    });

    if (!user_actualizado) {
      return crearRespuesta({
        success: false,
        error: 'No se pudo actualizar el usuario.',
      });
    }

    return crearRespuesta({
      success: true,
      data: UsuariosMapper.toUsuarioResponse(user_actualizado),
    });
  }
}
