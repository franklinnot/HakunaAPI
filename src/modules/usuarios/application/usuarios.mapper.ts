import { IUsuario } from '../domain/usuarios.entities';
import { IUsuarioResponse } from './usuarios.responses';

export class UsuariosMapper {
  static toUsuarioResponse(
    usuario: IUsuario,
    link_foto: string | null = null,
  ): IUsuarioResponse {
    return {
      id_usuario: usuario._id,
      link_foto: link_foto,
      nombre: usuario.nombre,
      username: usuario.username,
      createdAt: usuario.createdAt,
    };
  }
}
