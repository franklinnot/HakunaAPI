import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Put,
  Request,
  Inject,
} from '@nestjs/common';
import type { IUsuariosService } from '../application/usuarios.service.interface';
import { UpdateUsuarioDto } from './usuarios.dtos';
import type { IRequestWithUser } from 'src/modules/auth/presentation/auth.types';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    @Inject('IUsuariosService')
    private readonly usuariosService: IUsuariosService,
  ) {}

  // verificar si el username ya existe
  @Get('exists/:username')
  async existsUsuarioByUsername(@Param('username') username: string) {
    return await this.usuariosService.existsUsuarioByUsername(username);
  }

  // actualizar usuario
  @Put('update')
  async updateUsuario(
    @Request() req: IRequestWithUser,
    @Body() dto: UpdateUsuarioDto,
  ) {
    const usuario = req.user.data;
    return await this.usuariosService.updateUsuario(
      usuario!.id_usuario,
      dto.foto,
      dto.nombre,
      dto.username,
    );
  }

  // deshabilitar usuario
  @Patch('disable')
  async disableUsuario(@Request() req: IRequestWithUser) {
    const usuario = req.user.data;
    return await this.usuariosService.disableUsuario(usuario!.id_usuario);
  }

  // Buscar usuarios por nombre o username
  @Get('search/:q')
  async findAllByNombreOUsername(@Param('q') q: string) {
    return await this.usuariosService.findAllByNombreOUsername(q);
  }
}
