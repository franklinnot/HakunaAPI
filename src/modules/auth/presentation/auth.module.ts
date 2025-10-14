import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsuariosModule } from 'src/modules/usuarios/presentation/usuarios.module';
import { JwtStrategy } from './jwt/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from '../application/auth.service';
import { AuthUtils } from '../application/auth.utils';
import { BuscarUsuarioPorJWT } from '../application/use-cases/get-usuario-por-jwt';
import { IniciarSesion } from '../application/use-cases/iniciar-sesion';
import { RegistrarUsuario } from '../application/use-cases/registrar-usuario';
import { ArchivosModule } from 'src/modules/archivos/presentation/archivos.module';

@Module({
  imports: [
    ArchivosModule,
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
    AuthUtils,
    BuscarUsuarioPorJWT,
    IniciarSesion,
    RegistrarUsuario,
    JwtStrategy,
    {
      provide: 'IAuthService',
      useClass: AuthService,
    },
  ],
  exports: [JwtStrategy, 'IAuthService'],
  controllers: [AuthController],
})
export class AuthModule {}
