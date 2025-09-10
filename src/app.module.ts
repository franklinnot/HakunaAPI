import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // Cargar variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Conexión a la bd
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URI'),
        dbName: configService.get<string>('DB_NAME'),
      }),
    }),

    // Modulos
    UsuariosModule,
    AuthModule,
  ],
})
export class AppModule {}
