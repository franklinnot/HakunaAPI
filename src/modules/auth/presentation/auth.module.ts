import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsuariosModule } from 'src/modules/usuarios/presentation/usuarios.module';
import { JwtStrategy } from './jwt/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from '../application/auth.service';
import { AuthUtils } from '../application/auth.utils';
import { GetUsuarioByJWT } from '../application/use-cases/get-usuario-by-jwt';
import { IniciarSesion } from '../application/use-cases/iniciar-sesion';
import { CrearUsuario } from '../application/use-cases/crear-usuario';
import { AuthSocketService } from '../application/auth.socket.service';

@Module({
  imports: [
    UsuariosModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  providers: [
    // de utilidad
    AuthUtils,
    // casos de uso
    GetUsuarioByJWT,
    IniciarSesion,
    CrearUsuario,
    // guard
    JwtStrategy,
    // servicio
    {
      provide: 'IAuthService',
      useClass: AuthService,
    },
    AuthSocketService,
  ],
  exports: [JwtStrategy, 'IAuthService', AuthSocketService],
  controllers: [AuthController],
})
export class AuthModule {}
