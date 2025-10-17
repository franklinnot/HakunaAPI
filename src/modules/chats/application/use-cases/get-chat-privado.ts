import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IChatPrivadoResponse } from '../chats.responses';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import type {
  IChatRepository,
  IIntegranteRepository,
} from '../../infraestructure/chats.repositories.interfaces';
import { Estado } from 'src/shared/domain/enums';
import type { IMensajeRepository } from 'src/modules/mensajes/infraestructure/mensajes.repositories.interfaces';
import { IMensajeResponse } from 'src/modules/mensajes/application/mensajes.responses';
import { MensajesUtils } from 'src/modules/mensajes/application/mensajes.utils';
import { IArchivoResponse } from 'src/modules/archivos/application/archivos.responses';
import { ChatsUtils } from '../chats.utils';

@Injectable()
export class BuscarChatPrivado {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject('IIntegranteRepository')
    private readonly integranteRepository: IIntegranteRepository,
    @Inject('IMensajeRepository')
    private readonly mensajeRepository: IMensajeRepository,
    private readonly mensajesUtils: MensajesUtils,
    private readonly chatsUtils: ChatsUtils,
  ) {}

  async execute(
    id_chat: string,
    id_usuarioA: string,
  ): Promise<IRespuesta<IChatPrivadoResponse>> {
    const chat = await this.chatRepository.findById(id_chat);
    const usuarioA = await this.usuarioRepository.findById(id_usuarioA);

    if (!chat || chat.estado == Estado.DESHABILITADO) {
      return crearRespuesta({
        success: false,
        error: 'El chat no existe.',
      });
    }

    if (!usuarioA || usuarioA.estado == Estado.DESHABILITADO) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no existe.',
      });
    }

    const usuarioB = await this.chatsUtils.getUsuarioB(chat._id, usuarioA._id);
    const ultimo_mensaje =
      await this.mensajeRepository.findUltimoMensajeByChatId(chat._id);

    const historial_mensajes: IMensajeResponse[] = [];

    if (ultimo_mensaje) {
      const has_files = ultimo_mensaje.has_files;
      let archivos: IArchivoResponse[] | null = [];
      if (has_files) {
        archivos = await this.mensajesUtils.obtenerDetalles(ultimo_mensaje._id);
      }
      const emisor = await this.integranteRepository.findById(
        ultimo_mensaje.id_integrante,
      );
      const mensajeResponse = {
        id_mensaje: ultimo_mensaje._id,
        id_usuario: emisor!.id_usuario,
        id_chat: chat._id,
        es_grupal: chat.is_group,
        descripcion: ultimo_mensaje.descripcion,
        has_files: ultimo_mensaje.has_files,
        createdAt: ultimo_mensaje.createdAt,
        archivos: archivos,
        estado: ultimo_mensaje.estado,
      };
      historial_mensajes.push(mensajeResponse);
    }

    return crearRespuesta({
      success: true,
      data: {
        id_chat: chat._id,
        historial_mensajes: historial_mensajes,
        createdAt: chat.createdAt,
        usuarioB: usuarioB,
      },
    });
  }
}
