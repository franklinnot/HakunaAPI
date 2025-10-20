import { IRespuesta } from 'src/shared/application/response';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';

export interface JWTPayload {
  id_usuario: string;
  username: string;
}

export interface IRequestWithUser extends Request {
  user: IRespuesta<IUsuario>;
}
