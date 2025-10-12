import { IRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from './usuarios.responses';

export interface IUsuariosService {
  createUsuario(
    foto: string,
    nombre: string,
    username: string,
    password: string,
  ): Promise<IRespuesta<IUsuarioResponse>>;
  findAllByNombreOUsername(
    termino_busqueda: string,
  ): Promise<IRespuesta<IUsuarioResponse[]>>;
  existsUsuarioByUsername(username: string): Promise<IRespuesta<boolean>>;
  disableUsuario(id: string): Promise<IRespuesta<IUsuarioResponse>>;
  updateUsuario(
    id: string,
    foto: string | undefined,
    nombre: string | undefined,
    username: string | undefined,
    password: string | undefined,
  ): Promise<IRespuesta<IUsuarioResponse>>;
}
