import { Inject, Injectable } from '@nestjs/common';
import type { IChatRepository, IIntegranteRepository } from '../../infraestructure/chats.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IChatGrupalResponse, IIntegranteGrupalResponse } from '../chats.responses';
import { Estado } from 'src/shared/domain/enums';
import { ChatsMapper } from 'src/modules/chats/application/chats.mapper';
import type { IUsuariosService } from 'src/modules/usuarios/application/usuarios.service.interface';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';
import { ActualizarFotoGrupal } from './actualizar-foto-grupal';

@Injectable()
export class ActualizarChatGrupalUseCase {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject('IIntegranteRepository')
    private readonly integranteRepository: IIntegranteRepository,
    @Inject('IUsuariosService')
    private readonly usuariosService: IUsuariosService,
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
    private readonly actualizarFotoGrupal: ActualizarFotoGrupal,
  ) {}

  async execute(
    id_chat: string,
    id_usuario: string,
    foto?: string | null,
    nombre?: string,
    descripcion?: string,
  ): Promise<IRespuesta<IChatGrupalResponse>> {
    try {
      // Verificar que el chat existe
      const chatExistente = await this.chatRepository.findById(id_chat);
      if (!chatExistente || chatExistente.estado === Estado.DESHABILITADO) {
        return crearRespuesta({
          success: false,
          error: 'Chat grupal no encontrado',
        });
      }

      // Verificar que es un chat grupal
      if (!chatExistente.is_group) {
        return crearRespuesta({
          success: false,
          error: 'El chat especificado no es un chat grupal',
        });
      }

      // Verificar que el usuario es integrante del grupo
      const integrante = await this.integranteRepository.findOneByIdChatAndIdUsuario(
        id_chat,
        id_usuario,
      );

      if (!integrante || integrante.estado === Estado.DESHABILITADO) {
        return crearRespuesta({
          success: false,
          error: 'El usuario no pertenece a este chat grupal',
        });
      }

      // Verificar que el usuario es administrador (solo admins pueden actualizar)
      if (!integrante.is_admin) {
        return crearRespuesta({
          success: false,
          error: 'Solo los administradores pueden actualizar la información del grupo',
        });
      }

      // Preparar los datos a actualizar
      const datosActualizacion: any = {};
      
      // Procesar la foto si se proporciona
      if (foto !== undefined) {
        const resultadoFoto = await this.actualizarFotoGrupal.execute(id_chat, foto);
        if (resultadoFoto.success && resultadoFoto.data) {
          datosActualizacion.id_foto = resultadoFoto.data;
        } else if (foto === null) {
          // Si se pasa null explícitamente, eliminar la foto
          datosActualizacion.id_foto = null;
        }
      }
      
      if (nombre !== undefined && nombre.trim() !== '') {
        datosActualizacion.nombre = nombre.trim();
      }
      
      if (descripcion !== undefined) {
        datosActualizacion.descripcion = descripcion.trim();
      }

      // Actualizar el chat
      const chatActualizado = await this.chatRepository.update(id_chat, datosActualizacion);
      
      if (!chatActualizado) {
        return crearRespuesta({
          success: false,
          error: 'Error al actualizar el chat grupal',
        });
      }

      // Obtener los integrantes con información de usuarios para la respuesta
      const integrantes = await this.integranteRepository.findAllByIdChat(id_chat);
      const integrantesResponse: IIntegranteGrupalResponse[] = [];
      
      for (const integrante of integrantes) {
        if (integrante.estado === Estado.HABILITADO) {
          const usuarioData = await this.usuariosService.getUsuarioById(integrante.id_usuario);
          if (usuarioData.success && usuarioData.data) {
            integrantesResponse.push({
              ...usuarioData.data,
              is_admin: integrante.is_admin,
              fecha_union: integrante.createdAt,
              estado: integrante.estado,
            });
          }
        }
      }

      // Obtener link de foto del chat actualizado
      let link_foto_chat: string | null = null;
      
      if (chatActualizado.id_foto) {
        // Ahora siempre será un ID de archivo, buscar el link
        link_foto_chat = await this.archivoRepository.findLinkById(chatActualizado.id_foto);
      }

      // Retornar el chat actualizado usando el mapper
      const chatResponse = ChatsMapper.toChatGrupalResponse(
        chatActualizado,
        integrantesResponse,
        null, // historial_mensajes
        undefined, // ultimo_mensaje
        link_foto_chat, // link_foto
      );

      return crearRespuesta({
        success: true,
        data: chatResponse,
      });
    } catch (error) {
      return crearRespuesta({
        success: false,
        error: 'Error interno del servidor al actualizar el chat grupal',
      });
    }
  }
}