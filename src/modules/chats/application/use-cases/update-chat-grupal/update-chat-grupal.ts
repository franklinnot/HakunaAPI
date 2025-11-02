import { Inject, Injectable } from '@nestjs/common';
import type {
  IChatRepository,
  IIntegranteRepository,
} from '../../../infraestructure/chats.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IChatGrupalResponse } from '../../chats.responses';
import { Estado } from 'src/shared/domain/enums';
import { ChatsMapper } from 'src/modules/chats/application/chats.mapper';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';
import { UpdateFotoGrupal } from './update-foto-grupal';
import { ChatsUtils } from '../../chats.utils';

@Injectable()
export class UpdateChatGrupal {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject('IIntegranteRepository')
    private readonly integranteRepository: IIntegranteRepository,
    @Inject()
    private readonly chatsUtils: ChatsUtils,
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
    @Inject()
    private readonly updateFotoGrupal: UpdateFotoGrupal,
  ) {}

  async execute(
    id_usuario: string,
    id_chat: string,
    nombre?: string,
    descripcion?: string,
    foto?: string | null,
  ): Promise<IRespuesta<IChatGrupalResponse>> {
    // Verificar que el chat existe
    const chat = await this.chatRepository.findOne({
      _id: id_chat,
      estado: Estado.HABILITADO,
      is_group: true,
    });
    if (!chat) {
      return crearRespuesta({
        success: false,
        error: 'Chat grupal no encontrado',
      });
    }

    // Verificar que el usuario es integrante del grupo
    const integrante = await this.integranteRepository.findOne({
      id_chat: id_chat,
      id_usuario: id_usuario,
      estado: Estado.HABILITADO,
    });

    if (!integrante) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no pertenece a este chat grupal',
      });
    }

    // Verificar que el usuario es administrador (solo admins pueden actualizar)
    if (!integrante.is_admin) {
      return crearRespuesta({
        success: false,
        error:
          'Solo los administradores pueden actualizar la información del grupo',
      });
    }

    let new_link: string | null = null;
    // si se pide cambio
    if (foto !== undefined) {
      new_link = await this.updateFotoGrupal.execute(
        id_usuario,
        foto,
        chat.id_foto,
      );
    } else {
      // no se pidió cambio: obtener link actual
      new_link = chat.id_foto
        ? await this.archivoRepository.findLinkById(chat.id_foto)
        : null;
    }

    // Actualizar el chat
    const chatActualizado = await this.chatRepository.update(id_chat, {
      nombre: nombre || chat.nombre,
      descripcion: descripcion || chat.descripcion,
    });

    if (!chatActualizado) {
      return crearRespuesta({
        success: false,
        error: 'No se pudo actualizar el chat grupal',
      });
    }

    // Obtener los integrantes con información de usuarios para la respuesta
    const integrantesResponse =
      await this.chatsUtils.getIntegrantesResponseByChat(chat);

    // Retornar el chat actualizado usando el mapper
    const chatResponse = ChatsMapper.toChatGrupalResponse(
      chatActualizado,
      integrantesResponse,
      [], // historial_mensajes
      null, // ultimo_mensaje
      new_link, // link_foto
      integrante.estado, // estado_miembro
    );

    return crearRespuesta({
      success: true,
      data: chatResponse,
    });
  }
}
