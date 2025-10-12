import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IAuthResponse } from '../auth.responses';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import { UsuariosMapper } from 'src/modules/usuarios/application/usuarios.mapper';
import { AuthUtils } from '../auth.utils';

@Injectable()
export class BuscarUsuarioPorJWT {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly authUtils: AuthUtils,
  ) {}

  async execute(
    id_usuario: string,
    username: string,
  ): Promise<IRespuesta<IAuthResponse>> {
    const token = this.authUtils.generarJWT(id_usuario, username);
    const user = await this.usuarioRepository.findById(id_usuario);

    return crearRespuesta({
      success: true,
      data: {
        usuario: UsuariosMapper.toUsuarioResponse(user!),
        token: token,
      },
    });
  }
}
