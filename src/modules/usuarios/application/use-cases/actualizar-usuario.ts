import { Inject, Injectable } from '@nestjs/common';
import type { IUsuarioRepository } from '../../infraestructure/usuarios.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from '../usuarios.responses';
import { UsuariosMapper } from '../usuarios.mapper';
import type { IArchivosService } from 'src/modules/archivos/application/archivos.service.interface';
import { IArchivoResponse } from 'src/modules/archivos/application/archivos.responses';

@Injectable()
export class ActualizarUsuario {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IArchivosService')
    private readonly archivosService: IArchivosService,
  ) {}

  async execute(
    id: string,
    foto: string,
    nombre: string,
    username: string,
    password: string,
  ): Promise<IRespuesta<IUsuarioResponse>> {
    const usuario = await this.usuarioRepository.findById(id);

    if (!usuario) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no existe.',
      });
    }

    // si se incluye username
    if (username) {
      const user = await this.usuarioRepository.findOne({
        username: username,
      });
      if (user && user._id != id) {
        return crearRespuesta({
          success: false,
          error: 'El username ya existe.',
        });
      }
    }

    // si se incluye la foto
    let archivoResponse: IRespuesta<IArchivoResponse> | null = null;
    // si el usuario no tiene foto
    if (foto && !usuario.id_foto) {
      archivoResponse = await this.archivosService.guardarImagen(foto, null);
      // si el usuario ya tiene una foto
    } else if (foto && usuario.id_foto) {
      archivoResponse = await this.archivosService.actualizarImagen(
        usuario.id_foto,
        foto,
        null,
      );
    }

    const user_actualizado = await this.usuarioRepository.update(id, {
      id_foto: foto ? archivoResponse?.data?.id_archivo : null,
      nombre,
      username,
      password,
    });

    if (!user_actualizado) {
      return crearRespuesta({
        success: false,
        error: 'No se pudo actualizar el usuario.',
      });
    }

    return crearRespuesta({
      success: true,
      data: UsuariosMapper.toUsuarioResponse(
        user_actualizado,
        archivoResponse?.data?.link,
      ),
    });
  }
}
