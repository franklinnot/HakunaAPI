import { Usuario } from 'src/modules/usuarios/domain/schemas/usuario.schema';

export interface AuthResponse {
  usuario: Usuario;
  token: string;
}
