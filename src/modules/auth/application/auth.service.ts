import { Injectable } from '@nestjs/common';
import {
  Respuesta,
  crearRespuesta,
} from 'src/shared/application/types/respuesta.interface';
import { AuthResponse } from './types/auth-response.interface';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from 'src/modules/usuarios/application/usuarios.service';
import { Usuario } from 'src/modules/usuarios/domain/schemas/usuario.schema';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioDto } from 'src/modules/usuarios/application/dto/create-usuario.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  generarJWT(user: Usuario): string {
    const payload = { username: user.username, id: user._id };
    return this.jwtService.sign(payload);
  }

  async login(dto: LoginDto): Promise<Respuesta<AuthResponse>> {
    const rpta = await this.usuariosService.getUserWithPassByUsername(
      dto.username,
    );
    const user = rpta.data;
    if (
      !rpta.success ||
      !user ||
      !(await bcrypt.compare(dto.password, user.password))
    ) {
      return crearRespuesta<AuthResponse>({
        success: false,
        error: 'Credenciales incorrectas.',
      });
    }

    const userObject: Partial<Usuario> = user.toObject<Usuario>();
    if (userObject.password) delete userObject.password;
    const token = this.generarJWT(userObject as Usuario);

    return crearRespuesta<AuthResponse>({
      success: true,
      data: {
        usuario: userObject as Usuario,
        token: token,
      },
    });
  }

  async create(dto: CreateUsuarioDto): Promise<Respuesta<AuthResponse>> {
    const rpta = await this.usuariosService.create(dto);
    const user = rpta.data;

    if (!rpta.success || !user) {
      return crearRespuesta({
        success: false,
        error: rpta.error,
      });
    }

    const token = this.generarJWT(user);

    return crearRespuesta({
      success: true,
      data: {
        usuario: user,
        token: token,
      },
    });
  }

  byJWT(rpta: Respuesta<Usuario>): Respuesta<AuthResponse> {
    const user = rpta.data;

    if (!rpta.success || !user) {
      return crearRespuesta({
        success: false,
        error: rpta.error,
      });
    }
    const token = this.generarJWT(user);
    return crearRespuesta({
      success: true,
      data: {
        usuario: user,
        token: token,
      },
    });
  }
}
