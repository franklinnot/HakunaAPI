import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta } from 'src/shared/application/response';
import { IChatGrupalResponse } from '../chats.responses';
import { crearRespuesta } from 'src/shared/application/response';
import type { IChatRepository } from '../../infraestructure/chats.repositories.interfaces';
import type { IIntegranteRepository } from '../../infraestructure/chats.repositories.interfaces';
import { ChatsUtils } from '../chats.utils';
import { ChatsMapper } from '../chats.mapper';
import { Estado } from 'src/shared/domain/enums';
import { UsuariosUtils } from 'src/modules/usuarios/application/usuarios.utils';
import { MensajesUtils } from 'src/modules/mensajes/application/mensajes.utils';
import { GetMensajesGrupales } from 'src/modules/mensajes/application/use-cases/get-mensajes-grupales';
import { EmisorEventos } from 'src/socket/emisor-eventos';
import { TipoEvento } from 'src/shared/domain/enums';

@Injectable()
export class AddMemberToGroup {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject('IIntegranteRepository')
    private readonly integranteRepository: IIntegranteRepository,
    @Inject()
    private readonly chatsUtils: ChatsUtils,
    @Inject()
    private readonly usuariosUtils: UsuariosUtils,
    @Inject()
    private readonly mensajesUtils: MensajesUtils,
    @Inject()
    private readonly getMensajesGrupalesCU: GetMensajesGrupales,
    @Inject()
    private readonly emisorEventos: EmisorEventos,
  ) {}

  async execute(
    id_usuario: string,
    id_chat: string,
    id_nuevo_miembro: string,
  ): Promise<IRespuesta<IChatGrupalResponse>> {
    try {
      // Verificar que el chat existe
      const chat = await this.chatRepository.findById(id_chat);
      if (!chat) {
        return crearRespuesta({
          success: false,
          error: 'Chat no encontrado',
        });
      }

      // Verificar que el usuario que hace la petición es miembro del grupo
      const usuarioSolicitante = await this.integranteRepository.findOne({
        id_chat: id_chat,
        id_usuario: id_usuario,
        estado: Estado.HABILITADO,
      });

      if (!usuarioSolicitante) {
        return crearRespuesta({
          success: false,
          error: 'No tienes permisos para agregar miembros a este grupo',
        });
      }

      // Verificar que el usuario a agregar existe
      const nuevoMiembro = await this.usuariosUtils.getUsuarioResponseById(
        id_nuevo_miembro,
      );
      if (!nuevoMiembro) {
        return crearRespuesta({
          success: false,
          error: 'Usuario no encontrado',
        });
      }

      // Verificar que el usuario no es ya miembro del grupo
      const miembroExistente = await this.integranteRepository.findOne({
        id_chat: id_chat,
        id_usuario: id_nuevo_miembro,
        estado: Estado.HABILITADO,
      });

      if (miembroExistente) {
        return crearRespuesta({
          success: false,
          error: 'El usuario ya es miembro del grupo',
        });
      }

      // Agregar el nuevo miembro
      await this.integranteRepository.create({
        id_chat: id_chat,
        id_usuario: id_nuevo_miembro,
        is_admin: false,
        estado: Estado.HABILITADO,
      });

      // Actualizar la cantidad de integrantes en el chat
      await this.chatRepository.update(id_chat, {
        cantidad_integrantes: chat.cantidad_integrantes + 1,
      });

      // Obtener el chat actualizado
      const chatActualizado = await this.chatRepository.findById(id_chat);
      
      // Obtener los integrantes actualizados
      const integrantesResponse = await this.chatsUtils.getIntegrantesResponseByChat(
        chatActualizado!,
      );

      // Obtener el historial completo de mensajes para el nuevo miembro
      const mensajesResponse = await this.getMensajesGrupalesCU.execute(
        id_nuevo_miembro,
        id_chat,
      );
      
      const historialMensajes = mensajesResponse.success && mensajesResponse.data 
        ? mensajesResponse.data 
        : [];

      // Obtener el último mensaje
      const ultimoMensaje = await this.mensajesUtils.getUltimoMensaje(id_chat);

      // Crear la respuesta del chat grupal con historial completo
      const chatResponse = ChatsMapper.toChatGrupalResponse(
        chatActualizado!,
        integrantesResponse,
        historialMensajes, // historial completo de mensajes
        ultimoMensaje, // último mensaje
        chatActualizado!.id_foto,
      );

      // Emitir evento socket para notificar a todos los miembros del grupo
      this.emisorEventos.emit(TipoEvento.NUEVO_INTEGRANTE, {
        id_chat: id_chat,
        nuevo_miembro: nuevoMiembro,
        chat_actualizado: chatResponse,
      });

      return crearRespuesta({
        success: true,
        data: chatResponse,
      });
    } catch (error) {
      return crearRespuesta({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  }
}