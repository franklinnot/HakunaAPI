import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbConfigModule } from './dbconfig.module';
import { ArchivosModule } from './modules/archivos/presentation/archivos.module';
import { UsuariosModule } from './modules/usuarios/presentation/usuarios.module';
import { AuthModule } from './modules/auth/presentation/auth.module';
import { ChatsModule } from './modules/chats/presentation/chats.module';
import { MensajesModule } from './modules/mensajes/presentation/mensajes.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    // Cargar variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // emisod de eventos
    EventEmitterModule.forRoot(),

    // Modulos
    DbConfigModule,
    ArchivosModule,
    UsuariosModule,
    AuthModule,
    ChatsModule,
    MensajesModule,
  ],
})
export class AppModule {}
