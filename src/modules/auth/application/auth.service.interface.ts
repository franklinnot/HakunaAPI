import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import { IRespuesta } from '../../../shared/application/response';
import { IAuthResponse } from './auth.responses';

export interface IAuthService {
  iniciarSesion(
    username: string,
    password: string,
  ): Promise<IRespuesta<IAuthResponse>>;
  crearUsuario(
    nombre: string,
    username: string,
    password: string,
    foto?: string,
  ): Promise<IRespuesta<IAuthResponse>>;
  getUsuarioByJWT(usuario: IUsuario): Promise<IRespuesta<IAuthResponse>>;
}
