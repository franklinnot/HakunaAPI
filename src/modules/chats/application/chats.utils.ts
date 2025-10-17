import { Inject, Injectable } from '@nestjs/common';
import { IUsuarioResponse } from 'src/modules/usuarios/application/usuarios.responses';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import type { IChatRepository } from '../infraestructure/chats.repositories.interfaces';
import type { IIntegranteRepository } from '../infraestructure/chats.repositories.interfaces';
import type { IMensajeRepository } from 'src/modules/mensajes/infraestructure/mensajes.repositories.interfaces';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';
import { MensajesUtils } from 'src/modules/mensajes/application/mensajes.utils';
import { UsuariosMapper } from 'src/modules/usuarios/application/usuarios.mapper';
import { IChat } from '../domain/chats.entities';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import { crearRespuesta, IRespuesta } from 'src/shared/application/response';
import { IChatPrivadoResponse } from './chats.responses';

@Injectable()
export class ChatsUtils {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject('IIntegranteRepository')
    private readonly integranteRepository: IIntegranteRepository,
    @Inject('IMensajeRepository')
    private readonly mensajeRepository: IMensajeRepository,
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
    private readonly mensajesUtils: MensajesUtils,
  ) {}

  async getUsuarioB(
    id_chat: string,
    id_usuarioA: string,
  ): Promise<IUsuarioResponse> {
    const integrantes =
      await this.integranteRepository.findAllByIdChat(id_chat);

    const integranteB = integrantes.find((i) => i.id_usuario != id_usuarioA);

    const usuarioB = await this.usuarioRepository.findById(
      integranteB!.id_usuario,
    );

    const link_foto = await this.archivoRepository.findLinkById(
      usuarioB!.id_foto || '',
    );

    return UsuariosMapper.toUsuarioResponse(usuarioB!, link_foto);
  }

  async returnChat(
    chat: IChat,
    usuarioA: IUsuario,
    usuarioB: IUsuario,
  ): Promise<IRespuesta<IChatPrivadoResponse>> {
    await this.integranteRepository.registerIntegrantes(chat._id, [
      { id_usuario: usuarioA._id, is_admin: false },
      { id_usuario: usuarioB._id, is_admin: false },
    ]);

    const link_foto = await this.archivoRepository.findLinkById(
      usuarioB.id_foto || '',
    );

    const usuarioBResponse = UsuariosMapper.toUsuarioResponse(
      usuarioB,
      link_foto,
    );

    return crearRespuesta({
      success: true,
      data: {
        id_chat: chat._id,
        usuarioB: usuarioBResponse,
        historial_mensajes: null,
        createdAt: chat.createdAt,
      },
    });
  }
}
