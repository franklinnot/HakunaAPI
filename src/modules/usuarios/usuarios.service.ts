import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';
// Schemas
import { Usuario } from './schemas/usuario.schema';
// Repositories
import { UsuarioRepository } from './repositories/usuario.repository';
// DTO'S
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async existsUsuario(filterQuery: FilterQuery<Usuario>): Promise<boolean> {
    return this.usuarioRepository.exists(filterQuery);
  }

  async findAllUsuarios(filterQuery: FilterQuery<Usuario>): Promise<Usuario[]> {
    return this.usuarioRepository.findAll(filterQuery);
  }

  async findOneUsuarioById(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    return usuario;
  }

  async update(id: string, dto: UpdateUsuarioDto): Promise<Usuario> {
    await this.findOneUsuarioById(id);

    // si se incluye username o email se verifica que sean unicos
    if (dto.username) {
      const existing = await this.usuarioRepository.findOne({
        username: dto.username,
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('El username ya pertenece a otro usuario.');
      }
    }
    if (dto.email) {
      const existing = await this.usuarioRepository.findOne({
        email: dto.email,
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('El email ya pertenece a otro usuario.');
      }
    }

    const usuarioActualizado = await this.usuarioRepository.update(id, dto);
    if (!usuarioActualizado) {
      throw new NotFoundException(
        `Usuario con ID "${id}" no encontrado al intentar actualizar.`,
      );
    }

    return usuarioActualizado;
  }

  async disable(id: string): Promise<Usuario> {
    const usuarioDeshabilitado = await this.usuarioRepository.disable(id);

    if (!usuarioDeshabilitado) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }

    return usuarioDeshabilitado;
  }

  async enable(id: string): Promise<Usuario> {
    const usuarioHabilitado = await this.usuarioRepository.enable(id);

    if (!usuarioHabilitado) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }

    return usuarioHabilitado;
  }

  async createUser(dto: CreateUsuarioDto): Promise<Partial<Usuario>> {
    let existe = await this.usuarioRepository.exists({
      username: dto.username,
    });
    if (existe) {
      throw new ConflictException('El username ya existe');
    }

    existe = await this.usuarioRepository.exists({
      email: dto.email,
    });
    if (existe) {
      throw new ConflictException('El correo ya existe');
    }

    const newUser = await this.usuarioRepository.create(dto);
    const userObject: Partial<Usuario> = newUser.toObject<Usuario>();

    if (userObject.password) delete userObject.password;

    return userObject;
  }
}
