import { Inject, Injectable } from '@nestjs/common';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';
import type { IUsuarioRepository } from '../infraestructure/usuarios.repositories.interfaces';
import { IUsuarioResponse } from './usuarios.responses';
import { UsuariosMapper } from './usuarios.mapper';
import { IUsuario } from '../domain/usuarios.entities';

@Injectable()
export class UsuariosUtils {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
  ) {}

  async getUsuarioResponse(usuario: IUsuario): Promise<IUsuarioResponse> {
    const link_foto = await this.archivoRepository.findLinkById(
      usuario.id_foto || '',
    );

    return UsuariosMapper.toUsuarioResponse(usuario, link_foto);
  }

  async getUsuarioResponseById(
    id_usuario: string,
  ): Promise<IUsuarioResponse | null> {
    const usuario = await this.usuarioRepository.findById(id_usuario);

    if (!usuario) return null;

    const link_foto = await this.archivoRepository.findLinkById(
      usuario.id_foto || '',
    );

    return UsuariosMapper.toUsuarioResponse(usuario, link_foto);
  }
}
