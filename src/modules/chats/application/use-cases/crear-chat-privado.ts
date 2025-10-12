import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import {
  IChatPrivadoResponse,
  IIntegrantePrivadoResponse,
} from '../chats.responses';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import type {
  IChatRepository,
  IIntegranteRepository,
} from '../../infraestructure/chats.repositories.interfaces';
import { Estado } from 'src/shared/domain/enums';
import { UsuariosMapper } from 'src/modules/usuarios/application/usuarios.mapper';
import { IChat } from '../../domain/chats.entities';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import type { IMensajeRepository } from 'src/modules/mensajes/infraestructure/mensajes.repositories.interfaces';
import { MensajesUtils } from 'src/modules/mensajes/application/mensajes.utils';

@Injectable()
export class CrearChatPrivado {
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
  ) {}

  async execute(
    id_usuarioA: string,
    id_usuarioB: string,
  ): Promise<IRespuesta<IChatPrivadoResponse>> {
    if (id_usuarioA == id_usuarioB || !id_usuarioA || !id_usuarioB) {
      return crearRespuesta({
        success: false,
        error: 'Solicitud inválida.',
      });
    }

    const usuarioA = await this.usuarioRepository.findById(id_usuarioA);
    const usuarioB = await this.usuarioRepository.findById(id_usuarioB);

    if (
      !usuarioA ||
      !usuarioB ||
      usuarioA.estado == Estado.DESHABILITADO ||
      usuarioB.estado == Estado.DESHABILITADO
    ) {
      return crearRespuesta({
        success: false,
        error: 'Solicitud inválida.',
      });
    }

    const old_chat = await this.chatRepository.findChatPrivadoByIdUsuarios(
      id_usuarioA,
      id_usuarioB,
    );

    if (old_chat) {
      return crearRespuesta({
        success: false,
        error: 'El chat ya existe.',
      });
    }

    const new_chat = await this.chatRepository.create({
      is_group: false,
      cantidad_integrantes: 2,
    });

    return await this.returnChat(new_chat, usuarioA, usuarioB);
  }

  async returnChat(
    chat: IChat,
    usuarioA: IUsuario,
    usuarioB: IUsuario,
  ): Promise<IRespuesta<IChatPrivadoResponse>> {
    const integrantes = await this.integranteRepository.registerIntegrantes(
      chat._id,
      [
        { id_usuario: usuarioA._id, is_admin: false },
        { id_usuario: usuarioB._id, is_admin: false },
      ],
    );

    const id_integranteA = integrantes.find(
      (i) => i.id_usuario == usuarioA._id,
    )?._id;

    const id_integranteB = integrantes.find(
      (i) => i.id_usuario == usuarioB._id,
    )?._id;

    const integranteB: IIntegrantePrivadoResponse = {
      id_integrante: id_integranteB!,
      ...UsuariosMapper.toUsuarioResponse(usuarioB),
    };

    return crearRespuesta({
      success: true,
      data: {
        id_chat: chat._id,
        id_integranteA: id_integranteA!,
        integranteB: integranteB,
        historial_mensajes: null,
        createdAt: chat.createdAt,
      },
    });
  }
}
