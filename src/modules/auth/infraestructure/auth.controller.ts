import { Controller, Post, Body, Request } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { CreateUsuarioDto } from 'src/modules/usuarios/application/dto/create-usuario.dto';
import { Public } from '../application/decorators/public.decorator';
import { LoginDto } from '../application/dto/login.dto';

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
