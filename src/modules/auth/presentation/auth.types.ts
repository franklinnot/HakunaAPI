import { IRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from 'src/modules/usuarios/application/usuarios.responses';

export interface JWTPayload {
  id_usuario: string;
  username: string;
}

export interface IRequestWithUser extends Request {
  user: IRespuesta<IUsuarioResponse>;
}
