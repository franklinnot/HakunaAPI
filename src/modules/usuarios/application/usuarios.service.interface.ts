import { IRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from './usuarios.responses';

export interface IUsuariosService {
  createUsuario(
    foto: string | null,
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
    foto: string | null | undefined,
    nombre: string | null | undefined,
    username: string | null | undefined,
  ): Promise<IRespuesta<IUsuarioResponse>>;
}
