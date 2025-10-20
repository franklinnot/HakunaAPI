import { IRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from './usuarios.responses';
import { IUsuario } from '../domain/usuarios.entities';

export interface IUsuariosService {
  createUsuario(
    nombre: string,
    username: string,
    password: string,
    foto?: string,
  ): Promise<IRespuesta<IUsuarioResponse>>;
  getUsuariosPorNombreOUsername(
    id_usuario: string,
    termino_busqueda: string,
  ): Promise<IRespuesta<IUsuarioResponse[]>>;
  existeUsuarioPorUsername(username: string): Promise<IRespuesta<boolean>>;
  disableUsuario(id_usuario: string): Promise<IRespuesta<boolean>>;
  updateUsuario(
    usuario: IUsuario,
    nombre?: string,
    username?: string,
    foto?: string | null,
  ): Promise<IRespuesta<IUsuarioResponse>>;
}
