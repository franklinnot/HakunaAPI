import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @Public() // ruta publica, sin validacion
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.authService.regitrar_usuario(createUsuarioDto);
  }

  @Public() // ruta publica, sin validacion
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // @Get('refresh-token')
  // @HttpCode(HttpStatus.OK)
  // renewToken(@Request() req) {
  //   // req.user es el objeto que devuelve el método validate() de JwtStrategy
  //   return this.authService.generarJWT(req.user);
  // }
}
