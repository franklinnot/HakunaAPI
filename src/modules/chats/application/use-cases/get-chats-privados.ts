import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IChatPrivadoResponse } from '../chats.responses';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import type {
  IChatRepository,
  IIntegranteRepository,
} from '../../infraestructure/chats.repositories.interfaces';
import { Estado } from 'src/shared/domain/enums';
import { UsuariosMapper } from 'src/modules/usuarios/application/usuarios.mapper';
import { IChat } from '../../domain/chats.entities';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';
import { IUsuarioResponse } from 'src/modules/usuarios/application/usuarios.responses';
import { GetMensajesPrivados } from 'src/modules/mensajes/application/use-cases/get-mensajes-privados';

@Injectable()
export class BuscarChatsPrivados {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject('IIntegranteRepository')
    private readonly integranteRepository: IIntegranteRepository,
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
    private readonly getMensajesPrivadosService: GetMensajesPrivados,
  ) {}

  async execute(
    id_usuario: string,
  ): Promise<IRespuesta<IChatPrivadoResponse[]>> {
    if (!id_usuario) {
      return crearRespuesta({
        success: false,
        error: 'Solicitud inválida.',
      });
    }

    const usuario = await this.usuarioRepository.findById(id_usuario);

    if (!usuario || usuario.estado === Estado.DESHABILITADO) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no existe o está deshabilitado.',
      });
    }

    const chats =
      await this.chatRepository.findChatsPrivadosByIdUsuario(id_usuario);

    const chatsResponse = await this.buildChatsPrivados(usuario, chats);

    return crearRespuesta({
      success: true,
      data: chatsResponse,
    });
  }

  async buildChatsPrivados(
    usuarioA: IUsuario,
    chats: IChat[],
  ): Promise<IChatPrivadoResponse[]> {
    const chatsResponse: IChatPrivadoResponse[] = [];

    for (const chat of chats) {
      const usuarioB = await this.getUsuarioB(chat._id, usuarioA._id);

      // obtener historial completo
      const mensajesResult = await this.getMensajesPrivadosService.execute(
        usuarioA._id,
        chat._id,
      );

      const historial_mensajes = mensajesResult.success
        ? mensajesResult.data!
        : [];

      // ultimo mensaje si existe
      const ultimo_mensaje = historial_mensajes.length
        ? historial_mensajes[historial_mensajes.length - 1]
        : undefined;

      chatsResponse.push({
        id_chat: chat._id,
        historial_mensajes,
        createdAt: chat.createdAt,
        usuarioB,
        ultimo_mensaje,
      });
    }

    // ordenar por fecha
    chatsResponse.sort((a, b) => {
      const fechaA = a.ultimo_mensaje
        ? new Date(a.ultimo_mensaje.createdAt).getTime()
        : 0;
      const fechaB = b.ultimo_mensaje
        ? new Date(b.ultimo_mensaje.createdAt).getTime()
        : 0;
      return fechaB - fechaA;
    });

    return chatsResponse;
  }

  async getUsuarioB(
    id_chat: string,
    id_usuarioA: string,
  ): Promise<IUsuarioResponse> {
    const integrantes =
      await this.integranteRepository.findAllByIdChat(id_chat);

    const integranteB = integrantes.find((i) => i.id_usuario !== id_usuarioA);

    const usuarioB = await this.usuarioRepository.findById(
      integranteB!.id_usuario,
    );

    const link_foto = await this.archivoRepository.findLinkById(
      usuarioB!.id_foto || '',
    );

    return UsuariosMapper.toUsuarioResponse(usuarioB!, link_foto);
  }
}
