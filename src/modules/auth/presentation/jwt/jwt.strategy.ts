import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Estado } from 'src/shared/domain/enums';
import { JWTPayload } from '../auth.types';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IUsuarioResponse } from 'src/modules/usuarios/application/usuarios.responses';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import { UsuariosMapper } from 'src/modules/usuarios/application/usuarios.mapper';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'PerritoSalchicha',
    });
  }

  async validate(payload: JWTPayload): Promise<IRespuesta<IUsuarioResponse>> {
    const { id_usuario } = payload;
    const user = await this.usuarioRepository.findById(id_usuario);

    if (!user) {
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
      data: UsuariosMapper.toUsuarioResponse(user),
    });
  }
}
