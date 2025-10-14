import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IAuthResponse } from '../auth.responses';
import * as bcrypt from 'bcrypt';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import { UsuariosMapper } from 'src/modules/usuarios/application/usuarios.mapper';
import { AuthUtils } from '../auth.utils';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';

@Injectable()
export class IniciarSesion {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
    private readonly authUtils: AuthUtils,
  ) {}

  async execute(
    username: string,
    password: string,
  ): Promise<IRespuesta<IAuthResponse>> {
    if (
      username.trim().toLowerCase().length < 2 ||
      password.trim().length < 6
    ) {
      return crearRespuesta<IAuthResponse>({
        success: false,
        error: 'Credenciales incorrectas.',
      });
    }

    const user =
      await this.usuarioRepository.findOneByUsernameWithPass(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return crearRespuesta<IAuthResponse>({
        success: false,
        error: 'Credenciales incorrectas.',
      });
    }

    let link_foto: string | null = null;
    if (user.id_foto) {
      link_foto = await this.archivoRepository.findLinkById(user.id_foto);
    }

    const token = this.authUtils.generarJWT(user._id, user.username);

    return crearRespuesta<IAuthResponse>({
      success: true,
      data: {
        usuario: UsuariosMapper.toUsuarioResponse(user, link_foto),
        token: token,
      },
    });
  }
}
