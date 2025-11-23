import { IChat, IIntegrante } from '../domain/chats.entities';
import {
  IChatGrupalResponse,
  IIntegranteGrupalResponse,
} from './chats.responses';
import { IUsuarioResponse } from 'src/modules/usuarios/application/usuarios.responses';
import { IMensajeResponse } from 'src/modules/mensajes/application/mensajes.responses';
import { Estado } from 'src/shared/domain/enums';

export class ChatsMapper {
  static toChatGrupalResponse(
    chat: IChat,
    integrantes: IIntegranteGrupalResponse[],
    historial_mensajes: IMensajeResponse[],
    ultimo_mensaje: IMensajeResponse | null,
    link_foto: string | null,
    estado_miembro: Estado,
  ): IChatGrupalResponse {
    return {
      id_chat: chat._id,
      historial_mensajes: historial_mensajes,
      ultimo_mensaje: ultimo_mensaje || null,
      createdAt: chat.createdAt,
      link_foto: link_foto,
      nombre: chat.nombre,
      descripcion: chat.descripcion,
      integrantes: integrantes,
      cantidad_integrantes: integrantes.length, // Usar la cantidad real de integrantes activos
      is_group: true,
      estado_miembro: estado_miembro,
    };
  }

  static toIntegranteGrupalResponse(
    integrante: IIntegrante,
    usuario: IUsuarioResponse,
  ): IIntegranteGrupalResponse {
    return {
      ...usuario,
      is_admin: integrante.is_admin,
      fecha_union: integrante.createdAt,
      estado: integrante.estado,
    };
  }
}
