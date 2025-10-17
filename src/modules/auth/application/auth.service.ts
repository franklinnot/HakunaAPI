import { IRespuesta } from 'src/shared/application/response';
import { IAuthResponse } from './auth.responses';
import { IAuthService } from './auth.service.interface';
import { IniciarSesion } from './use-cases/iniciar-sesion';
import { RegistrarUsuario } from './use-cases/registrar-usuario';
import { Injectable } from '@nestjs/common';
import { BuscarUsuarioPorJWT } from './use-cases/get-usuario-por-jwt';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly iniciarSesion: IniciarSesion,
    private readonly registrarUsuario: RegistrarUsuario,
    private readonly buscarUsuarioPorJWT: BuscarUsuarioPorJWT,
  ) {}
  async login(
    username: string,
    password: string,
  ): Promise<IRespuesta<IAuthResponse>> {
    return this.iniciarSesion.execute(username, password);
  }

  async register(
    foto: string | null | undefined,
    nombre: string,
    username: string,
    password: string,
  ): Promise<IRespuesta<IAuthResponse>> {
    return this.registrarUsuario.execute(foto, nombre, username, password);
  }

  async byJWT(
    id_usuario: string,
    username: string,
  ): Promise<IRespuesta<IAuthResponse>> {
    return this.buscarUsuarioPorJWT.execute(id_usuario, username);
  }
}
