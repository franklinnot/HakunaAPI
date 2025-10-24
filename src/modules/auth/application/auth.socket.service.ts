import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import { Estado } from 'src/shared/domain/enums';
import { crearRespuesta, IRespuesta } from 'src/shared/application/response';
import { JWTPayload } from '../presentation/auth.types';

@Injectable()
export class AuthSocketService {
  constructor(
    @Inject()
    private readonly jwtService: JwtService,
    @Inject()
    private readonly configService: ConfigService,
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async validateToken(token: string): Promise<IRespuesta<IUsuario>> {
    try {
      const payload = this.jwtService.verify<JWTPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.usuarioRepository.findById(payload.id_usuario);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
      if (user.estado === Estado.DESHABILITADO) {
        throw new UnauthorizedException('Usuario deshabilitado');
      }

      return crearRespuesta({ success: true, data: user });
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
