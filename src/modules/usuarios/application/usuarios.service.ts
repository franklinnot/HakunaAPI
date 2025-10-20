import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from './usuarios.responses';
import { IUsuariosService } from './usuarios.service.interface';
import { CrearUsuario } from './use-cases/crear-usuario';
import { GetUsuariosPorNombreOUsername } from './use-cases/get-users-by-name-or-username';
import { ExisteUsuarioPorUsername } from './use-cases/existe-usuario-por-username';
import { DisableUsuario } from './use-cases/disable-usuario';
import { UpdateUsuario } from './use-cases/update-usuario/update-usuario';
import { IUsuario } from '../domain/usuarios.entities';

@Injectable()
export class UsuariosService implements IUsuariosService {
  constructor(
    @Inject()
    private readonly crearUsuarioCU: CrearUsuario,
    @Inject()
    private readonly getUsuariosPorNombreOUsernameCU: GetUsuariosPorNombreOUsername,
    @Inject()
    private readonly existeUsuarioPorUsernameCU: ExisteUsuarioPorUsername,
    @Inject()
    private readonly disableUsuarioCU: DisableUsuario,
    @Inject()
    private readonly updateUsuarioCU: UpdateUsuario,
  ) {}

  async createUsuario(
    nombre: string,
    username: string,
    password: string,
    foto?: string,
  ): Promise<IRespuesta<IUsuarioResponse>> {
    return await this.crearUsuarioCU.execute(nombre, username, password, foto);
  }

  async getUsuariosPorNombreOUsername(
    id_usuario: string,
    palabra: string,
  ): Promise<IRespuesta<IUsuarioResponse[]>> {
    return await this.getUsuariosPorNombreOUsernameCU.execute(
      id_usuario,
      palabra,
    );
  }

  async existeUsuarioPorUsername(
    username: string,
  ): Promise<IRespuesta<boolean>> {
    return await this.existeUsuarioPorUsernameCU.execute(username);
  }

  async disableUsuario(id_usuario: string): Promise<IRespuesta<boolean>> {
    return this.disableUsuarioCU.execute(id_usuario);
  }

  async updateUsuario(
    usuario: IUsuario,
    nombre?: string,
    username?: string,
    foto?: string | null,
  ): Promise<IRespuesta<IUsuarioResponse>> {
    return this.updateUsuarioCU.execute(usuario, nombre, username, foto);
  }
}
