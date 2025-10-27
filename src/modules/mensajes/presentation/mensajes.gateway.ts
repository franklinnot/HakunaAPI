import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AppSocket } from 'src/socket/app.socket';
import { IMensajePrivadoResponse } from '../application/mensajes.responses';
import { TipoEvento } from 'src/shared/domain/enums';

@Injectable()
export class MensajesGateway {
  private readonly logger = new Logger('MensajesGateway');

  constructor(
    @Inject()
    private readonly appGateway: AppSocket,
  ) {}

  @OnEvent(TipoEvento.NUEVO_MENSAJE_PRIVADO)
  handleMensajePrivado(payload: {
    idUsuarioA: string;
    idUsuarioB: string;
    mensaje: IMensajePrivadoResponse;
  }) {
    const { idUsuarioA, idUsuarioB, mensaje } = payload;
    this.appGateway.emitToUsers(
      [idUsuarioA, idUsuarioB],
      TipoEvento.NUEVO_MENSAJE_PRIVADO,
      mensaje,
    );

    this.logger.log(
      `Mensaje privado enviado entre ${idUsuarioA} y ${idUsuarioB}`,
    );
  }
}
