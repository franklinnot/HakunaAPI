import {
  Controller,
  Get,
  Body,
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
  @Get('existe-by-username/:username')
  async existeUsuarioPorUsername(@Param('username') username: string) {
    return await this.usuariosService.existeUsuarioPorUsername(username);
  }

  // actualizar usuario
  @Put('update')
  async updateUsuario(
    @Request() req: IRequestWithUser,
    @Body() dto: UpdateUsuarioDto,
  ) {
    const usuario = req.user.data;
    return await this.usuariosService.updateUsuario(
      usuario!,
      dto.nombre,
      dto.username,
      dto.foto,
    );
  }

  // deshabilitar usuario
  @Put('disable')
  async disableUsuario(@Request() req: IRequestWithUser) {
    const usuario = req.user.data;
    return await this.usuariosService.disableUsuario(usuario!._id);
  }

  // Buscar usuarios por nombre o username
  @Get('search/:q')
  async getUsuariosPorNombreOUsername(
    @Request() req: IRequestWithUser,
    @Param('q') q: string,
  ) {
    const usuario = req.user.data;
    return await this.usuariosService.getUsuariosPorNombreOUsername(
      usuario!._id,
      q,
    );
  }
}
