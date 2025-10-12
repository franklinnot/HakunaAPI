import { Inject, Injectable } from '@nestjs/common';
import type { IUsuarioRepository } from '../../infraestructure/usuarios.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from '../usuarios.responses';
import { Estado } from 'src/shared/domain/enums';
import { UsuariosMapper } from '../usuarios.mapper';

@Injectable()
export class BuscarUsuariosPorNombreOUsername {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(content: string): Promise<IRespuesta<IUsuarioResponse[]>> {
    const palabra = content.trim();

    if (!palabra || palabra.length <= 2) {
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
      return nombre.includes(palabra) || username.includes(palabra);
    });

    const result = usuariosFiltrados.map((usuario) =>
      UsuariosMapper.toUsuarioResponse(usuario),
    );

    return crearRespuesta({
      success: true,
      data: result.length > 0 ? result : null,
    });
  }
}
