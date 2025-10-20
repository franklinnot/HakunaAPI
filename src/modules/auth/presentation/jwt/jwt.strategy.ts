import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Estado } from 'src/shared/domain/enums';
import { JWTPayload } from '../auth.types';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject()
    private readonly configService: ConfigService,
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JWTPayload): Promise<IRespuesta<IUsuario>> {
    const { id_usuario } = payload;
    const user = await this.usuarioRepository.findById(id_usuario);

    if (!user) {
      throw new UnauthorizedException(
        crearRespuesta({
          success: false,
          error: 'Usuario no encontrado.',
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
