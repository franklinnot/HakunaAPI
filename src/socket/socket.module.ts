import { Module } from '@nestjs/common';
import { AuthModule } from '../modules/auth/presentation/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppSocket } from './app.socket';
import { EmisorEventos } from './emisor-eventos';

@Module({
  imports: [
    // emisod de eventos
    EventEmitterModule.forRoot(),
    AuthModule,
  ],
  providers: [AppSocket, EmisorEventos],
  exports: [AppSocket, EmisorEventos],
})
export class SocketModule {}
