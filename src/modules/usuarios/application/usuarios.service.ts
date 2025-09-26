import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { Usuario } from '../domain/schemas/usuario.schema';
import { UsuarioRepository } from '../domain/repositories/usuario.repository';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Estado } from 'src/shared/domain/enums/estado.enum';
import {
  Respuesta,
  crearRespuesta,
} from 'src/shared/application/types/respuesta.interface';

@Injectable()
export class UsuariosService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  //#region Genericos
  async existsById(id: string): Promise<Respuesta<boolean>> {
    const existe = await this.usuarioRepository.existsById(id);
    if (!existe) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no existe.',
      });
    }
    return crearRespuesta({
      success: true,
      data: existe,
    });
  }

  async findById(id: string): Promise<Respuesta<Usuario>> {
    const usuario = await this.usuarioRepository.findById(id);
    if (usuario == null) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no existe.',
      });
    }
    return crearRespuesta({
      success: true,
      data: usuario,
    });
  }

  async findAll(
    filterQuery: FilterQuery<Usuario>,
  ): Promise<Respuesta<Usuario[]>> {
    filterQuery = { ...filterQuery, estado: Estado.HABILITADO };
    const usuarios = await this.usuarioRepository.findAll(filterQuery);

    if (!usuarios) {
      return crearRespuesta({
        success: false,
        error: 'No se encontraron usuarios.',
      });
    }
    return crearRespuesta({
      success: true,
      data: usuarios.length > 0 ? usuarios : [],
    });
  }

  async disable(id: string): Promise<Respuesta<Usuario>> {
    const usuario = await this.usuarioRepository.disable(id);

    if (!usuario) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no existe.',
      });
    }

    return crearRespuesta({
      success: true,
      data: usuario,
    });
  }
  //#endregion

  async existsByUsername(username: string): Promise<Respuesta<boolean>> {
    const existe = await this.usuarioRepository.existsByUsername(username);
    if (!existe) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no existe.',
      });
    }
    return crearRespuesta({
      success: true,
      data: existe,
    });
  }

  async findByUsername(username: string): Promise<Respuesta<Usuario>> {
    const usuario = await this.usuarioRepository.findByUsername(username);
    if (!usuario) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no existe.',
      });
    }
    return crearRespuesta({
      success: true,
      data: usuario,
    });
  }

  async create(dto: CreateUsuarioDto): Promise<Respuesta<Usuario>> {
    const existe = await this.existsByUsername(dto.username);
    if (existe.data) {
      return crearRespuesta({
        success: false,
        error: 'El username ya existe.',
      });
    }

    const newUser = await this.usuarioRepository.create(dto);
    const userObject: Partial<Usuario> = newUser.toObject<Usuario>();

    if (userObject.password) delete userObject.password;

    return crearRespuesta({
      success: true,
      data: userObject as Usuario,
    });
  }

  async update(id: string, dto: UpdateUsuarioDto): Promise<Respuesta<Usuario>> {
    const rpta = await this.existsById(id);
    if (!rpta.success) {
      return crearRespuesta({
        success: false,
        error: rpta.error,
      });
    }

    // si se incluye username
    if (dto.username) {
      const user = (await this.findByUsername(dto.username)).data;
      if (user && user.id !== id) {
        return crearRespuesta({
          success: false,
          error: 'El username ya existe.',
        });
      }
    }

    const user_actualizado = await this.usuarioRepository.update(id, dto);
    if (!user_actualizado) {
      return crearRespuesta({
        success: false,
        error: 'El username ya existe.',
      });
    }

    return crearRespuesta({
      success: true,
      data: user_actualizado,
    });
  }

  async getUserWithPassByUsername(
    username: string,
  ): Promise<Respuesta<Usuario>> {
    const user =
      await this.usuarioRepository.getUserWithPassByUsername(username);
    if (!user) {
      return crearRespuesta<Usuario>({
        success: false,
        error: 'El usuario no existe.',
      });
    }
    return crearRespuesta<Usuario>({
      success: true,
      data: user,
    });
  }
}
