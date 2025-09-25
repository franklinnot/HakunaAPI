import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Estado } from 'src/shared/domain/enums/estado.enum';
import { JWTPayload } from '../interfaces/jwt-payload.interface';
import { UsuariosService } from 'src/modules/usuarios/application/usuarios.service';
import {
  Respuesta,
  crearRespuesta,
} from 'src/shared/infraestructure/interfaces/respuesta.interface';
import { Usuario } from 'src/modules/usuarios/domain/schemas/usuario.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usuariosService: UsuariosService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'PerritoSalchicha',
    });
  }

  async validate(payload: JWTPayload): Promise<Respuesta<Usuario>> {
    const { id } = payload;
    const rpta = await this.usuariosService.findById(id);
    const user = rpta.data;

    if (!rpta.success || !user) {
      throw new UnauthorizedException(
        crearRespuesta({
          success: false,
          error: 'Token no válido.',
        }).error,
      );
    } else if (user.estado == Estado.DESHABILITADO) {
      throw new UnauthorizedException(
        crearRespuesta({
          success: false,
          error: 'Usuario deshabilitado.',
        }).error,
      );
    }

    return crearRespuesta({
      success: true,
      data: user,
    });
  }
}
