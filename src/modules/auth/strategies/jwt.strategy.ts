import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EstadoEnum } from 'src/common/enums/estado.enum';
import { UsuariosService } from 'src/modules/usuarios/usuarios.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usuariosService: UsuariosService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'PerritoSalchicha',
    });
  }

  async validate(payload: any) {
    const { id } = payload;
    const user = await this.usuariosService.findById(id);

    if (!user) {
      throw new UnauthorizedException('Token no válido.');
    }
    if (user.estado == EstadoEnum.DESHABILITADO) {
      throw new UnauthorizedException('Usuario deshabilitado.');
    }

    return user;
  }
}
