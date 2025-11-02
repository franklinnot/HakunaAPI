import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta } from 'src/shared/application/response';
import { IChatGrupalResponse } from '../chats.responses';
import { crearRespuesta } from 'src/shared/application/response';
import type { IChatRepository } from '../../infraestructure/chats.repositories.interfaces';
import type { IIntegranteRepository } from '../../infraestructure/chats.repositories.interfaces';
import { ChatsUtils } from '../chats.utils';
import { ChatsMapper } from '../chats.mapper';
import { Estado, TipoEvento } from 'src/shared/domain/enums';
import { EmisorEventos } from 'src/socket/emisor-eventos';
import { UsuariosUtils } from 'src/modules/usuarios/application/usuarios.utils';

@Injectable()
export class RemoveMemberFromGroup {
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
    private readonly emisorEventos: EmisorEventos,
  ) {}

  async execute(
    id_usuario: string,
    id_chat: string,
    id_miembro_a_eliminar: string,
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
          error: 'No tienes permisos para eliminar miembros de este grupo',
        });
      }

      // Verificar que el miembro a eliminar existe en el grupo
      const miembroAEliminar = await this.integranteRepository.findOne({
        id_chat: id_chat,
        id_usuario: id_miembro_a_eliminar,
        estado: Estado.HABILITADO,
      });

      if (!miembroAEliminar) {
        return crearRespuesta({
          success: false,
          error: 'El usuario no es miembro del grupo',
        });
      }

      // No permitir eliminar administradores
      if (miembroAEliminar.is_admin) {
        return crearRespuesta({
          success: false,
          error: 'No se puede eliminar a un administrador del grupo',
        });
      }

      // Deshabilitar al miembro (no eliminar para mantener historial)
      await this.integranteRepository.update(miembroAEliminar._id, {
        estado: Estado.DESHABILITADO,
      });

      // Sincronizar la cantidad de integrantes en la base de datos
      await this.chatsUtils.sincronizarCantidadIntegrantes(id_chat);

      // Obtener el chat actualizado
      const chatActualizado = await this.chatRepository.findById(id_chat);
      
      // Obtener los integrantes actualizados
      const integrantesResponse = await this.chatsUtils.getIntegrantesResponseByChat(
        chatActualizado!,
      );

      // Crear la respuesta del chat grupal
      const chatResponse = ChatsMapper.toChatGrupalResponse(
        chatActualizado!,
        integrantesResponse,
        [], // historial_mensajes - se puede obtener si es necesario
        null, // ultimo_mensaje - se puede obtener si es necesario
        chatActualizado!.id_foto,
        usuarioSolicitante.estado, // estado_miembro
      );

      // Obtener información del miembro eliminado
      const miembroEliminado = await this.usuariosUtils.getUsuarioResponseById(
        id_miembro_a_eliminar,
      );

      // Emitir evento socket para notificar la eliminación del miembro
      this.emisorEventos.emit(TipoEvento.INTEGRANTE_ELIMINADO, {
        id_chat: id_chat,
        miembro_eliminado: miembroEliminado,
        id_miembro_eliminado: id_miembro_a_eliminar,
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