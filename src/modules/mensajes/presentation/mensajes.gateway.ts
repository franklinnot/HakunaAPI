import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AppSocket } from 'src/socket/app.socket';
import {
  IMensajeGrupalResponse,
  IMensajePrivadoResponse,
} from '../application/mensajes.responses';
import { TipoEvento } from 'src/shared/domain/enums';
import { MensajesGrupalesUtils } from '../application/mensajes-grupales.utils';
import { IUsuarioResponse } from 'src/modules/usuarios/application/usuarios.responses';
import { IChatGrupalResponse } from 'src/modules/chats/application/chats.responses';

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
    nuevo_miembro: IUsuarioResponse;
    chat_actualizado: IChatGrupalResponse;
  }) {
    const { id_chat, nuevo_miembro, chat_actualizado } = payload;
    this.logger.log(`Nuevo integrante agregado al chat: ${id_chat}`);

    // Obtener todos los usuarios del chat usando el servicio de utilidad
    const usuariosIds =
      await this.mensajesGrupalesUtils.obtenerUsuariosDelChat(id_chat);

    // Emitir el evento a todos los usuarios del grupo
    this.appGateway.emitToUsers(usuariosIds, TipoEvento.NUEVO_INTEGRANTE, {
      id_chat,
      nuevo_miembro,
      chat_actualizado,
    });

    this.logger.log(
      `Evento NUEVO_INTEGRANTE enviado a ${usuariosIds.length} usuarios del chat ${id_chat}`,
    );
  }

  @OnEvent(TipoEvento.INTEGRANTE_ELIMINADO)
  async handleIntegranteEliminado(payload: {
    id_chat: string;
    miembro_eliminado: IUsuarioResponse | null;
    id_miembro_eliminado: string;
    chat_actualizado: IChatGrupalResponse;
  }) {
    const {
      id_chat,
      miembro_eliminado,
      id_miembro_eliminado,
      chat_actualizado,
    } = payload;
    this.logger.log(`Integrante eliminado del chat: ${id_chat}`);

    // Obtener todos los usuarios del chat (miembros activos) usando el servicio de utilidad
    const usuariosIds =
      await this.mensajesGrupalesUtils.obtenerUsuariosDelChat(id_chat);

    // Emitir el evento a todos los usuarios del grupo (miembros activos)
    this.appGateway.emitToUsers(usuariosIds, TipoEvento.INTEGRANTE_ELIMINADO, {
      id_chat,
      miembro_eliminado,
      chat_actualizado,
    });

    // Crear una copia del chat_actualizado para el miembro eliminado con estado DESHABILITADO
    const chatParaMiembroEliminado = {
      ...chat_actualizado,
      estado_miembro: 'DESHABILITADO', // Estado del miembro eliminado
    };

    // Emitir evento específico al miembro eliminado con el chat actualizado
    this.appGateway.emitToUser(
      id_miembro_eliminado,
      TipoEvento.INTEGRANTE_ELIMINADO,
      {
        id_chat,
        miembro_eliminado,
        chat_actualizado: chatParaMiembroEliminado,
        eliminado_del_grupo: true, // Flag para indicar que fue eliminado
      },
    );

    this.logger.log(
      `Evento INTEGRANTE_ELIMINADO enviado a ${usuariosIds.length} usuarios del chat ${id_chat} y al miembro eliminado con chat actualizado`,
    );
  }

  @OnEvent(TipoEvento.GRUPO_ELIMINADO)
  handleGrupoEliminado(payload: {
    id_chat: string;
    usuarios_afectados: string[];
    nombre_grupo: string;
  }) {
    const { id_chat, usuarios_afectados, nombre_grupo } = payload;
    this.logger.log(`Grupo eliminado: ${id_chat}`);

    // Emitir el evento a todos los usuarios que estaban en el grupo
    this.appGateway.emitToUsers(
      usuarios_afectados,
      TipoEvento.GRUPO_ELIMINADO,
      {
        id_chat,
        nombre_grupo,
        mensaje: 'El grupo ha sido eliminado completamente',
      },
    );

    this.logger.log(
      `Evento GRUPO_ELIMINADO enviado a ${usuarios_afectados.length} usuarios del chat ${id_chat}`,
    );
  }
}
