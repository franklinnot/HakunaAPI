import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IAuthResponse } from '../auth.responses';
import { AuthUtils } from '../auth.utils';
import { UsuariosUtils } from 'src/modules/usuarios/application/usuarios.utils';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';

@Injectable()
export class GetUsuarioByJWT {
  constructor(
    @Inject()
    private readonly usuariosUtils: UsuariosUtils,
    @Inject()
    private readonly authUtils: AuthUtils,
  ) {}

  async execute(usuario: IUsuario): Promise<IRespuesta<IAuthResponse>> {
    const token = this.authUtils.generarJWT(usuario._id, usuario.username);
    const usuarioResponse =
      await this.usuariosUtils.getUsuarioResponse(usuario);

    return crearRespuesta({
      success: true,
      data: {
        usuario: usuarioResponse,
        token: token,
      },
    });
  }
}
