import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IAuthResponse } from '../auth.responses';
import * as bcrypt from 'bcrypt';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import { AuthUtils } from '../auth.utils';
import { UsuariosUtils } from 'src/modules/usuarios/application/usuarios.utils';

@Injectable()
export class IniciarSesion {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject()
    private readonly usuariosUtils: UsuariosUtils,
    @Inject()
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

    const usuarioResponse = await this.usuariosUtils.getUsuarioResponse(user);
    const token = this.authUtils.generarJWT(user._id, user.username);

    return crearRespuesta<IAuthResponse>({
      success: true,
      data: {
        usuario: usuarioResponse,
        token: token,
      },
    });
  }
}
