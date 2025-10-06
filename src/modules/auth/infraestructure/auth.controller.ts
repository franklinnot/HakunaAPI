import { Controller, Post, Body, Request } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { CreateUsuarioDto } from 'src/modules/usuarios/application/usuarios.dtos';
import { Public } from './auth.decorators';
import { LoginDto } from '../application/auth.dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // ruta publica, sin validacion
  @Post('register')
  register(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.authService.create(createUsuarioDto);
  }

  @Public() // ruta publica, sin validacion
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // devuelve un usuario usando su jwt
  @Post('by_jwt')
  by_jwt(@Request() req) {
    // req.user es el objeto Respuesta<Usuario> que envuelve PassportJS
    // en la respuesta del método validate() de JwtStrategy
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.authService.byJWT(req.user);
  }
}
