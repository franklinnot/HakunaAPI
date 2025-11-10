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

  @OnEvent(TipoEvento.NUEVO_INTEGRANTE)
  async handleNuevoIntegrante(payload: {
    id_chat: string;
    nuevo_miembro: any;
    chat_actualizado: any;
  }) {
    const { id_chat, nuevo_miembro, chat_actualizado } = payload;
    this.logger.log(`Nuevo integrante agregado al chat: ${id_chat}`);
    
    // Obtener todos los usuarios del chat usando el servicio de utilidad
    const usuariosIds = await this.mensajesGrupalesUtils.obtenerUsuariosDelChat(id_chat);

    // Emitir el evento a todos los usuarios del grupo
    this.appGateway.emitToUsers(usuariosIds, TipoEvento.NUEVO_INTEGRANTE, {
      id_chat,
      nuevo_miembro,
      chat_actualizado
    });
    
    this.logger.log(
      `Evento NUEVO_INTEGRANTE enviado a ${usuariosIds.length} usuarios del chat ${id_chat}`,
    );
  }
}
