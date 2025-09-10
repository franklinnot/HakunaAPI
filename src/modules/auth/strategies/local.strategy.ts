import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Usuario } from 'src/modules/usuarios/schemas/usuario.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username',
    });
  }

  async validate(
    username: string,
    password: string,
  ): Promise<Partial<Usuario>> {
    const user = await this.authService.validarCredenciales(username, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }
    return user;
  }
}
