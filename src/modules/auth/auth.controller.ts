import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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

  // registro de usuarios
  @Public() // ruta publica
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  // login
  @Public() // ruta publica, sin validacion
  @UseGuards(AuthGuard('local')) // activar LocalStrategy
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto, @Request() req) {
    // req.user es el objeto que devuelve el método validate() de LocalStrategy
    return this.authService.generarJWT(req.user);
  }

  // generar un nuevo token para el usuario ya autenticado.
  @Get('renew')
  @HttpCode(HttpStatus.OK)
  renewToken(@Request() req) {
    // req.user es el objeto que devuelve el método validate() de JwtStrategy
    return this.authService.generarJWT(req.user);
  }
}
