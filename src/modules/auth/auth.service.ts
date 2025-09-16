import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Usuario } from '../usuarios/schemas/usuario.schema';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  generarJWT(user: Partial<Usuario>) {
    const payload = { username: user.username, id: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usuariosService.getUserWithPassByUsername(
      dto.username,
    );

    if (user && (await bcrypt.compare(dto.password, user.password))) {
      const userObject: Partial<Usuario> = user.toObject<Usuario>();
      if (userObject.password) delete userObject.password;
    }

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }
    const token = this.generarJWT(user);
    return {
      user,
      ...token,
    };
  }

  async create(dto: CreateUsuarioDto) {
    const user = await this.usuariosService.create(dto);
    const token = this.generarJWT(user);
    return {
      user,
      ...token,
    };
  }
}
