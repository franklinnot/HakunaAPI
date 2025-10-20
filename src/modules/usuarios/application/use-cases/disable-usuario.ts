import { Inject, Injectable } from '@nestjs/common';
import type { IUsuarioRepository } from '../../infraestructure/usuarios.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';

@Injectable()
export class DisableUsuario {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(id_usuario: string): Promise<IRespuesta<boolean>> {
    const usuario = await this.usuarioRepository.disable(id_usuario);

    if (!usuario) {
      return crearRespuesta({
        success: false,
        error: 'No se pudo deshabilitar el usuario.',
      });
    }

    return crearRespuesta({
      success: true,
      data: true,
    });
  }
}
