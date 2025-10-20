import { Controller, Post, Body, Request, Inject } from '@nestjs/common';
import { RegisterUsuarioDto } from './auth.dtos';
import { Public } from './auth.decorators';
import { LoginDto } from './auth.dtos';
import type { IAuthService } from 'src/modules/auth/application/auth.service.interface';
import type { IRequestWithUser } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('IAuthService')
    private readonly authService: IAuthService,
  ) {}

  @Public()
  @Post()
  crearUsuario(@Body() dto: RegisterUsuarioDto) {
    return this.authService.crearUsuario(
      dto.nombre,
      dto.username,
      dto.password,
      dto.foto,
    );
  }

  @Public()
  @Post('login')
  iniciarSesion(@Body() dto: LoginDto) {
    return this.authService.iniciarSesion(dto.username, dto.password);
  }

  // devuelve un usuario usando su jwt)
  @Post('by-jwt')
  async getUsuarioByJWT(@Request() req: IRequestWithUser) {
    const usuario = req.user.data;
    return await this.authService.getUsuarioByJWT(usuario!);
  }
}
