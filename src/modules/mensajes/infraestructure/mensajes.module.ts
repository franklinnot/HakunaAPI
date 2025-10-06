import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MensajesService } from '../application/mensajes.service';
import { MensajesController } from './mensajes.controller';
import { Mensaje, MensajeSchema } from '../domain/schemas/mensaje.schema';
import { MensajeRepository } from '../domain/repositories/mensaje.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Mensaje.name, schema: MensajeSchema }]),
  ],
  controllers: [MensajesController],
  providers: [MensajesService, MensajeRepository],
  exports: [MensajesService],
})
export class MensajeModule {}
