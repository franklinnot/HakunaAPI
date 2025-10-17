import { IRespuesta } from '../../../shared/application/response';
import { IAuthResponse } from './auth.responses';

export interface IAuthService {
  login(username: string, password: string): Promise<IRespuesta<IAuthResponse>>;
  register(
    foto: string | null | undefined,
    nombre: string,
    username: string,
    password: string,
  ): Promise<IRespuesta<IAuthResponse>>;
  byJWT(
    id_usuario: string,
    username: string,
  ): Promise<IRespuesta<IAuthResponse>>;
}
