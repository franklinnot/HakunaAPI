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
import { EstadoEnum } from 'src/common/enums/estado.enum';

@Injectable()
export class UsuariosService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  //#region Genericos
  async existsById(id: string): Promise<boolean> {
    return this.usuarioRepository.existsById(id);
  }

  async findById(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario no encontrado.`);
    }
    return usuario;
  }

  async findAll(filterQuery: FilterQuery<Usuario>) {
    filterQuery = { ...filterQuery, estado: EstadoEnum.HABILITADO };
    return this.usuarioRepository.findAll(filterQuery);
  }

  async disable(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.disable(id);

    if (!usuario) {
      throw new NotFoundException(`Usuario no encontrado.`);
    }

    return usuario;
  }
  //#endregion

  async existsByUsername(username: string): Promise<boolean> {
    return await this.usuarioRepository.existsByUsername(username);
  }

  async findByUsername(username: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findByUsername(username);
    if (!usuario) {
      throw new NotFoundException(`Usuario no encontrado.`);
    }
    return usuario;
  }

  async create(dto: CreateUsuarioDto): Promise<Partial<Usuario>> {
    const existe = await this.existsByUsername(dto.username);
    if (existe) throw new ConflictException('El username ya existe');

    const newUser = await this.usuarioRepository.create(dto);
    const userObject: Partial<Usuario> = newUser.toObject<Usuario>();

    if (userObject.password) delete userObject.password;

    return userObject;
  }

  async update(id: string, dto: UpdateUsuarioDto): Promise<Usuario> {
    const existe = await this.existsById(id);
    if (!existe) {
      throw new NotFoundException(`Usuario no encontrado.`);
    }

    // si se incluye username
    if (dto.username) {
      const user = await this.findByUsername(dto.username);
      if (user && user.id !== id) {
        throw new ConflictException('El username ya existe.');
      }
    }

    const user_actualizado = await this.usuarioRepository.update(id, dto);
    if (!user_actualizado) {
      throw new NotFoundException(
        `Usuario no encontrado al intentar actualizar.`,
      );
    }

    return user_actualizado;
  }

  async getUserWithPassByUsername(username: string): Promise<Usuario | null> {
    return this.usuarioRepository.getUserWithPassByUsername(username);
  }
}
