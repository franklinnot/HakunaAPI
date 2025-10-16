import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IAuthResponse } from '../auth.responses';
import { AuthUtils } from '../auth.utils';
import type { IUsuariosService } from 'src/modules/usuarios/application/usuarios.service.interface';

@Injectable()
export class RegistrarUsuario {
  constructor(
    @Inject('IUsuariosService')
    private readonly usuariosService: IUsuariosService,
    private readonly authUtils: AuthUtils,
  ) {}

  async execute(
    foto: string | null | undefined,
    nombre: string,
    username: string,
    password: string,
  ): Promise<IRespuesta<IAuthResponse>> {
    const rpta = await this.usuariosService.createUsuario(
      foto,
      nombre,
      username,
      password,
    );
    const user = rpta.data;

    if (!user) {
      return crearRespuesta({
        success: false,
        error: rpta.error,
      });
    }

    const token = this.authUtils.generarJWT(user.id_usuario, user.username);

    return crearRespuesta({
      success: true,
      data: {
        usuario: user,
        token: token,
      },
    });
  }
}
