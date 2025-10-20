import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IAuthResponse } from '../auth.responses';
import { AuthUtils } from '../auth.utils';
import type { IUsuariosService } from 'src/modules/usuarios/application/usuarios.service.interface';

@Injectable()
export class CrearUsuario {
  constructor(
    @Inject('IUsuariosService')
    private readonly usuariosService: IUsuariosService,
    @Inject()
    private readonly authUtils: AuthUtils,
  ) {}

  async execute(
    nombre: string,
    username: string,
    password: string,
    foto?: string,
  ): Promise<IRespuesta<IAuthResponse>> {
    const rpta = await this.usuariosService.createUsuario(
      nombre,
      username,
      password,
      foto,
    );

    const user = rpta.data;

    if (!user || !rpta.success) {
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
