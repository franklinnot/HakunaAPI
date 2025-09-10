import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Usuario } from '../usuarios/schemas/usuario.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async validarCredenciales(
    username: string,
    pass: string,
  ): Promise<Partial<Usuario> | null> {
    const user = await this.usuariosService.findByUsernamePass(username);

    if (user && (await bcrypt.compare(pass, user.password))) {
      const userObject: Partial<Usuario> = user.toObject<Usuario>();
      if (userObject.password) delete userObject.password;
      return userObject;
    }
    return null;
  }

  // generar un jwt
  generarJWT(user: Partial<Usuario>) {
    const payload = { username: user.username, id: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
