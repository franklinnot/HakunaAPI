import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AppSocket } from 'src/socket/app.socket';
import {
  IMensajeGrupalResponse,
  IMensajePrivadoResponse,
} from '../application/mensajes.responses';
import { TipoEvento } from 'src/shared/domain/enums';
import { MensajesGrupalesUtils } from '../application/mensajes-grupales.utils';

@Injectable()
export class MensajesGateway {
  private readonly logger = new Logger('MensajesGateway');

  constructor(
    private readonly appGateway: AppSocket,
    private readonly mensajesGrupalesUtils: MensajesGrupalesUtils,
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

  @OnEvent(TipoEvento.NUEVO_MENSAJE_GRUPAL)
  async handleMensajeGrupal(payload: {
    idChat: string;
    mensaje: IMensajeGrupalResponse;
  }) {
    const { idChat, mensaje } = payload;
    this.logger.log(`Emitiendo mensaje grupal: ${mensaje.id_mensaje}`);

    // Obtener todos los usuarios del chat usando el servicio de utilidad
    const usuariosIds =
      await this.mensajesGrupalesUtils.obtenerUsuariosDelChat(idChat);

    // Emitir el mensaje a todos los usuarios del grupo
    this.appGateway.emitToUsers(
      usuariosIds,
      TipoEvento.NUEVO_MENSAJE_GRUPAL,
      mensaje,
    );

    this.logger.log(
      `Mensaje grupal enviado a ${usuariosIds.length} usuarios del chat ${idChat}`,
    );
  }
}
