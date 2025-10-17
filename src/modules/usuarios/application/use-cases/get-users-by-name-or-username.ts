import { Inject, Injectable } from '@nestjs/common';
import type { IUsuarioRepository } from '../../infraestructure/usuarios.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from '../usuarios.responses';
import { Estado } from 'src/shared/domain/enums';
import { UsuariosMapper } from '../usuarios.mapper';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';

@Injectable()
export class BuscarUsuariosPorNombreOUsername {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
  ) {}

  async execute(
    id_usuario: string,
    content: string,
  ): Promise<IRespuesta<IUsuarioResponse[]>> {
    const palabra = content.trim();

    if (!palabra || palabra.length < 2) {
      return crearRespuesta({
        success: false,
        error: 'Solicitud inválida.',
      });
    }

    const usuarios = await this.usuarioRepository.findAll({
      estado: Estado.HABILITADO,
    });

    if (!usuarios || usuarios.length == 0) {
      return crearRespuesta({
        success: false,
        error: 'No se encontraron usuarios.',
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
      let link_foto: string | null = null;
      if (usuario.id_foto) {
        link_foto = await this.archivoRepository.findLinkById(usuario.id_foto);
      }
      result.push(UsuariosMapper.toUsuarioResponse(usuario, link_foto));
    }

    return crearRespuesta({
      success: true,
      data: result.length > 0 ? result : null,
    });
  }
}
