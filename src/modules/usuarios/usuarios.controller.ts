import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import type { FilterQuery } from 'mongoose';
import { Usuario } from './schemas/usuario.schema';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // lista de usuarios: por username y nombre
  @Get()
  async findAll(@Query() filterQuery: FilterQuery<Usuario>) {
    const result = await this.usuariosService.findAll(filterQuery);
    return { result };
  }

  // verificar si el username ya existe /exists?username=<>
  @Get('exists')
  async checkExists(@Query('username') username: string) {
    const exists = await this.usuariosService.existsByUsername(username);
    return { exists };
  }

  // devuelve un usuario por su username
  @Get(':username')
  async findOne(@Param('username') username: string) {
    const user = await this.usuariosService.findByUsername(username);
    return { user };
  }

  // actualizar usuario
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return await this.usuariosService.update(id, updateUsuarioDto);
  }

  // deshabilitar usuario
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // codigo 204 No Content, estándar para deletes
  async disable(@Param('id') id: string) {
    return await this.usuariosService.disable(id);
  }
}
