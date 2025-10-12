import { IUsuarioResponse } from 'src/modules/usuarios/application/usuarios.responses';

export interface IAuthResponse {
  usuario: IUsuarioResponse;
  token: string;
}
