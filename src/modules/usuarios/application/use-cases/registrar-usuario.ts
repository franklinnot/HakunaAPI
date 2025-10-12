import { Inject, Injectable } from '@nestjs/common';
import type { IUsuarioRepository } from '../../infraestructure/usuarios.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from '../usuarios.responses';
import { Estado } from 'src/shared/domain/enums';
import { UsuariosMapper } from '../usuarios.mapper';

@Injectable()
export class RegistrarUsuario {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(
    foto: string,
    nombre: string,
    username: string,
    password: string,
  ): Promise<IRespuesta<IUsuarioResponse>> {
    const existe = await this.usuarioRepository.exists({
      username: username,
      estado: Estado.HABILITADO,
    });

    if (existe) {
      return crearRespuesta({
        success: false,
        error: 'El username ya existe.',
      });
    }

    const newUser = await this.usuarioRepository.create({
      id_foto: foto,
      nombre: nombre,
      username: username,
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
      data: UsuariosMapper.toUsuarioResponse(newUser),
    });
  }
}
