import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MensajeService } from '../application/message.service';
import { MessageController } from './message.controller';
import { Mensaje, MensajeSchema } from '../domain/schemas/message.schema';
import { MensajeRepository } from '../domain/repositories/message.repositories';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Mensaje.name, schema: MensajeSchema }]),
  ],
  controllers: [MessageController],
  providers: [MensajeService, MensajeRepository],
  exports: [MensajeService],
})
export class MensajeModule {}
