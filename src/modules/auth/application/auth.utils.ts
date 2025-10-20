import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from '../presentation/auth.types';

@Injectable()
export class AuthUtils {
  constructor(
    @Inject()
    private readonly jwtService: JwtService,
  ) {}

  generarJWT(id_usuario: string, username: string): string {
    const payload: JWTPayload = { id_usuario: id_usuario, username: username };
    return this.jwtService.sign(payload);
  }
}
