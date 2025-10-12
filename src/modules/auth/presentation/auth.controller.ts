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

  @Public() // ruta publica, sin validacion
  @Post('register')
  register(@Body() dto: RegisterUsuarioDto) {
    return this.authService.register(
      dto.foto,
      dto.nombre,
      dto.username,
      dto.password,
    );
  }

  @Public() // ruta publica, sin validacion
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }

  // devuelve un usuario usando su jwt)
  @Post('by-jwt')
  async byJWT(@Request() req: IRequestWithUser) {
    const usuario = req.user.data;
    return await this.authService.byJWT(usuario!.id_usuario, usuario!.username);
  }
}
