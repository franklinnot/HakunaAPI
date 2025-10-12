import { IUsuario } from '../domain/usuarios.entities';
import { IUsuarioResponse } from './usuarios.responses';

export class UsuariosMapper {
  static toUsuarioResponse(usuario: IUsuario): IUsuarioResponse {
    return {
      id_usuario: usuario._id,
      foto: null,
      nombre: usuario.nombre,
      username: usuario.username,
      createdAt: usuario.createdAt,
    };
  }
}
