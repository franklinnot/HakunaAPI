import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TipoEvento } from 'src/shared/domain/enums';

@Injectable()
export class EmisorEventos {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emit(event: TipoEvento, payload: any) {
    this.eventEmitter.emit(event, payload);
  }
}
