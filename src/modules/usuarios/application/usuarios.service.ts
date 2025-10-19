import { Injectable } from '@nestjs/common';
import { IRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from './usuarios.responses';
import { IUsuariosService } from './usuarios.service.interface';
import { RegistrarUsuario } from './use-cases/registrar-usuario';
import { BuscarUsuariosPorNombreOUsername } from './use-cases/get-users-by-name-or-username';
import { GetUsuarioById } from './use-cases/get-usuario-by-id';
import { ExisteUsuarioPorUsername } from './use-cases/existe-usuario-por-username';
import { DeshabilitarUsuario } from './use-cases/disable-usuario';
import { ActualizarUsuario } from './use-cases/actualizar-usuario';

@Injectable()
export class UsuariosService implements IUsuariosService {
  constructor(
    private readonly registrarUsuario: RegistrarUsuario,
    private readonly buscarUsuarios: BuscarUsuariosPorNombreOUsername,
    private readonly getUsuario: GetUsuarioById,
    private readonly existeUsuario: ExisteUsuarioPorUsername,
    private readonly deshabilitarUsuario: DeshabilitarUsuario,
    private readonly actualizarUsuario: ActualizarUsuario,
  ) {}

  async createUsuario(
    foto: string | null | undefined,
    nombre: string,
    username: string,
    password: string,
  ): Promise<IRespuesta<IUsuarioResponse>> {
    return await this.registrarUsuario.execute(
      foto,
      nombre,
      username,
      password,
    );
  }

  async findAllByNombreOUsername(
    id_usuario: string,
    content: string,
  ): Promise<IRespuesta<IUsuarioResponse[]>> {
    return await this.buscarUsuarios.execute(id_usuario, content);
  }

  async getUsuarioById(id: string): Promise<IRespuesta<IUsuarioResponse>> {
    return await this.getUsuario.execute(id);
  }

  async existsUsuarioByUsername(
    username: string,
  ): Promise<IRespuesta<boolean>> {
    return await this.existeUsuario.execute(username);
  }

  async disableUsuario(id: string): Promise<IRespuesta<IUsuarioResponse>> {
    return this.deshabilitarUsuario.execute(id);
  }

  async updateUsuario(
    id: string,
    foto: string | null | undefined,
    nombre: string | null | undefined,
    username: string | null | undefined,
  ): Promise<IRespuesta<IUsuarioResponse>> {
    return this.actualizarUsuario.execute(id, foto, nombre, username);
  }
}
