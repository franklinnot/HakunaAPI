import { Inject, Injectable } from '@nestjs/common';
import type { IUsuarioRepository } from '../../infraestructure/usuarios.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from '../usuarios.responses';
import { Estado } from 'src/shared/domain/enums';
import { UsuariosMapper } from '../usuarios.mapper';
import type { IArchivosService } from 'src/modules/archivos/application/archivos.service.interface';

@Injectable()
export class RegistrarUsuario {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IArchivosService')
    private readonly archivosService: IArchivosService,
  ) {}

  async execute(
    foto: string | null,
    nombre: string,
    username: string,
    password: string,
  ): Promise<IRespuesta<IUsuarioResponse>> {
    const existe = await this.usuarioRepository.exists({
      username: username.toLowerCase(),
      estado: Estado.HABILITADO,
    });

    if (existe) {
      return crearRespuesta({
        success: false,
        error: 'El username ya existe.',
      });
    }

    let link_foto: string | null = null;
    let id_foto: string | null = null;

    if (foto) {
      const archivoResponse = await this.archivosService.guardarImagen(
        foto,
        null,
      );
      link_foto = archivoResponse.data?.link || null;
      id_foto = archivoResponse.data?.id_archivo || null;
    }

    const newUser = await this.usuarioRepository.create({
      id_foto: id_foto,
      nombre: nombre,
      username: username.toLowerCase(),
      password: password,
    });

    if (!newUser) {
      return crearRespuesta({
        success: false,
        error: 'No se pudo crear el usuario.',
      });
    }

    return crearRespuesta({
      success: true,
      data: UsuariosMapper.toUsuarioResponse(newUser, link_foto),
    });
  }
}
