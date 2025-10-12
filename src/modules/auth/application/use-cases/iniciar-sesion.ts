import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IAuthResponse } from '../auth.responses';
import * as bcrypt from 'bcrypt';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import { UsuariosMapper } from 'src/modules/usuarios/application/usuarios.mapper';
import { AuthUtils } from '../auth.utils';

@Injectable()
export class IniciarSesion {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly authUtils: AuthUtils,
  ) {}

  async execute(
    username: string,
    password: string,
  ): Promise<IRespuesta<IAuthResponse>> {
    const user =
      await this.usuarioRepository.findOneByUsernameWithPass(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return crearRespuesta<IAuthResponse>({
        success: false,
        error: 'Credenciales incorrectas.',
      });
    }

    const token = this.authUtils.generarJWT(user._id, user.username);

    return crearRespuesta<IAuthResponse>({
      success: true,
      data: {
        usuario: UsuariosMapper.toUsuarioResponse(user),
        token: token,
      },
    });
  }
}
