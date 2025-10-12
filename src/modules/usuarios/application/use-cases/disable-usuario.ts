import { Inject, Injectable } from '@nestjs/common';
import type { IUsuarioRepository } from '../../infraestructure/usuarios.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from '../usuarios.responses';
import { UsuariosMapper } from '../usuarios.mapper';

@Injectable()
export class DeshabilitarUsuario {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(id: string): Promise<IRespuesta<IUsuarioResponse>> {
    const existe = await this.usuarioRepository.existsById(id);

    if (!existe) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no existe.',
      });
    }

    const usuario = await this.usuarioRepository.disable(id);

    if (!usuario) {
      return crearRespuesta({
        success: false,
        error: 'No se pudo deshabilitar el usuario.',
      });
    }

    return crearRespuesta({
      success: true,
      data: UsuariosMapper.toUsuarioResponse(usuario),
    });
  }
}
