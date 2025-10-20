import { IRespuesta } from 'src/shared/application/response';
import { IAuthResponse } from './auth.responses';
import { IAuthService } from './auth.service.interface';
import { IniciarSesion } from './use-cases/iniciar-sesion';
import { CrearUsuario } from './use-cases/crear-usuario';
import { Inject, Injectable } from '@nestjs/common';
import { GetUsuarioByJWT } from './use-cases/get-usuario-by-jwt';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject()
    private readonly iniciarSesionCU: IniciarSesion,
    @Inject()
    private readonly crearUsuarioCU: CrearUsuario,
    @Inject()
    private readonly getUsuarioByJWTCU: GetUsuarioByJWT,
  ) {}
  async iniciarSesion(
    username: string,
    password: string,
  ): Promise<IRespuesta<IAuthResponse>> {
    return await this.iniciarSesionCU.execute(username, password);
  }

  async crearUsuario(
    nombre: string,
    username: string,
    password: string,
    foto?: string,
  ): Promise<IRespuesta<IAuthResponse>> {
    return this.crearUsuarioCU.execute(nombre, username, password, foto);
  }

  async getUsuarioByJWT(usuario: IUsuario): Promise<IRespuesta<IAuthResponse>> {
    return this.getUsuarioByJWTCU.execute(usuario);
  }
}
