import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import type { FilterQuery } from 'mongoose';
import { Usuario } from './schemas/usuario.schema';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * Crear un nuevo usuario
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.createUser(createUsuarioDto);
  }

  /**
   * Devuelve una lista de todos los usuarios.
   */
  @Get()
  findAll(@Query() filterQuery: FilterQuery<Usuario>) {
    return this.usuariosService.findAllUsuarios(filterQuery);
  }

  /**
   * Verifica si un username o email ya existen.
   * Uso: /usuarios/exists?username=<> O /usuarios/exists?email=<>
   */
  @Get('exists')
  async checkExists(
    @Query('username') username?: string,
    @Query('email') email?: string,
  ) {
    if (!username && !email) {
      throw new BadRequestException(
        'Debe proporcionar un "username" o un "email" como query parameter.',
      );
    }

    const filter = username ? { username } : { email };
    const exists = await this.usuariosService.existsUsuario(filter);

    return { exists };
  }

  /**
   * Busca y devuelve un usuario por su ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOneUsuarioById(id);
  }

  /**
   * Actualiza los datos de un usuario por su ID.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  /**
   * Deshabilita un usuario por su ID.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Devuelve un código 204 No Content, estándar para deletes
  disable(@Param('id') id: string) {
    return this.usuariosService.disable(id);
  }

  /**
   * Habilita un usuario por su ID.
   */
  @Patch(':id/enable')
  @HttpCode(HttpStatus.OK)
  enable(@Param('id') id: string) {
    return this.usuariosService.enable(id);
  }
}
