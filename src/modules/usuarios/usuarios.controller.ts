import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  Put,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import type { FilterQuery } from 'mongoose';
import { Usuario } from './schemas/usuario.schema';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // lista de usuarios
  @Get('all')
  async all(@Query() filterQuery: FilterQuery<Usuario>) {
    return await this.usuariosService.findAll(filterQuery);
  }

  // devuelve un usuario por su username
  @Get('by_username/:username')
  async by_username(@Param('username') username: string) {
    return await this.usuariosService.findByUsername(username);
  }

  // verificar si el username ya existe
  @Get('exists/:username')
  async exists(@Param('username') username: string) {
    return await this.usuariosService.existsByUsername(username);
  }

  // actualizar usuario
  @Put('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    const result = await this.usuariosService.update(id, updateUsuarioDto);
    return { result };
  }

  // deshabilitar usuario
  @Patch('disable/:id')
  async disable(@Param('id') id: string) {
    return await this.usuariosService.disable(id);
  }
}
