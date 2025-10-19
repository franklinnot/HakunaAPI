import { Inject, Injectable } from '@nestjs/common';
import type { IUsuarioRepository } from '../../infraestructure/usuarios.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from '../usuarios.responses';
import { UsuariosMapper } from '../usuarios.mapper';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';

@Injectable()
export class GetUsuarioById {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
  ) {}

  async execute(id: string): Promise<IRespuesta<IUsuarioResponse>> {
    const usuario = await this.usuarioRepository.findById(id);

    if (!usuario) {
      return crearRespuesta({
        success: false,
        error: 'Usuario no encontrado.',
      });
    }

    let link_foto: string | null = null;
    if (usuario.id_foto) {
      link_foto = await this.archivoRepository.findLinkById(usuario.id_foto);
    }

    return crearRespuesta({
      success: true,
      data: UsuariosMapper.toUsuarioResponse(usuario, link_foto),
    });
  }
}