import { Inject, Injectable } from '@nestjs/common';
import type { IUsuarioRepository } from '../../infraestructure/usuarios.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from '../usuarios.responses';
import { Estado } from 'src/shared/domain/enums';
import { UsuariosUtils } from '../usuarios.utils';

@Injectable()
export class GetUsuariosPorNombreOUsername {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject()
    private readonly usuariosUtils: UsuariosUtils,
  ) {}

  async execute(
    id_usuario: string,
    palabra: string,
  ): Promise<IRespuesta<IUsuarioResponse[]>> {
    const usuarios = await this.usuarioRepository.findAll({
      estado: Estado.HABILITADO,
    });

    if (!usuarios || usuarios.length == 0) {
      return crearRespuesta({
        success: true,
        data: [],
      });
    }

    const usuariosFiltrados = usuarios.filter((usuario) => {
      const nombre = usuario.nombre.toLowerCase();
      const username = usuario.username.toLowerCase();
      const id = usuario._id;
      return (
        (nombre.includes(palabra) || username.includes(palabra)) &&
        id_usuario != id
      );
    });

    const result: IUsuarioResponse[] = [];

    for (const usuario of usuariosFiltrados) {
      result.push(await this.usuariosUtils.getUsuarioResponse(usuario));
    }

    return crearRespuesta({
      success: true,
      data: result.length > 0 ? result : [],
    });
  }
}
