import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IChatGrupalResponse } from '../chats.responses';
import type { IChatRepository, IIntegranteRepository } from '../../infraestructure/chats.repositories.interfaces';
import { Estado } from 'src/shared/domain/enums';
import { MensajesUtils } from 'src/modules/mensajes/application/mensajes.utils';
import { IChat } from '../../domain/chats.entities';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';
import { ChatsUtils } from '../chats.utils';

@Injectable()
export class GetChatGrupal {
  constructor(
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
    @Inject()
    private readonly mensajesUtils: MensajesUtils,
    @Inject()
    private readonly chatsUtils: ChatsUtils,
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject('IIntegranteRepository')
    private readonly integranteRepository: IIntegranteRepository,
  ) {}

  async execute(
    id_chat: string,
    id_usuario?: string,
    chat_existente?: IChat,
  ): Promise<IRespuesta<IChatGrupalResponse>> {
    let chat: IChat | null = null;
    if (!chat_existente) {
      chat = await this.chatRepository.findOne({
        _id: id_chat,
        estado: Estado.HABILITADO,
        is_group: true,
      });
      if (!chat) {
        return crearRespuesta({
          success: false,
          error: 'El chat no existe.',
        });
      }
    } else {
      chat = chat_existente;
    }

    // Obtener integrantes del chat con información completa
    const integrantesResponse = await this.chatsUtils.getIntegrantesResponseByChat(chat);
    
    // Obtener todos los integrantes del chat para validar permisos
    const todosLosIntegrantes = await this.integranteRepository.findAll({
      id_chat: id_chat
    });

    // obtener ultimo mensaje
    const ultimo_mensaje = await this.mensajesUtils.getUltimoMensaje(id_chat);

    const link_foto = await this.archivoRepository.findLinkById(
      chat.id_foto || '',
    );

    // Verificar que el usuario es miembro del chat y obtener su estado
    let estado_miembro = Estado.HABILITADO; // Por defecto para casos sin autenticación
    let integrante;
    
    if (id_usuario) {
      // Buscar al usuario en la lista de integrantes
      integrante = todosLosIntegrantes.find(i => i.id_usuario.toString() === id_usuario);
      
      // Si el usuario no es miembro del chat, no puede acceder
      if (!integrante) {
        return crearRespuesta({
          success: false,
          error: 'No tienes permisos para acceder a este chat',
        });
      }
      
      estado_miembro = integrante.estado;
      
      // Si el estado del integrante no está habilitado, no puede acceder
      if (estado_miembro !== Estado.HABILITADO) {
        return crearRespuesta({
          success: false,
          error: 'Tu acceso a este chat ha sido revocado',
        });
      }
    }

    // resultado
    return crearRespuesta({
      success: true,
      data: {
        id_chat: chat._id,
        historial_mensajes: ultimo_mensaje ? [ultimo_mensaje] : [],
        ultimo_mensaje: ultimo_mensaje,
        createdAt: chat.createdAt,
        link_foto: link_foto,
        nombre: chat.nombre,
        descripcion: chat.descripcion,
        integrantes: integrantesResponse,
        cantidad_integrantes: chat.cantidad_integrantes,
        is_group: true,
        estado_miembro: estado_miembro,
      },
    });
  }
}
