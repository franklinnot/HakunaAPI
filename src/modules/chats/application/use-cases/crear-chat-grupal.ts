import { Inject, Injectable } from '@nestjs/common';
import type {
  IChatRepository,
  IIntegranteRepository,
} from '../../infraestructure/chats.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import {
  IChatGrupalResponse,
  IIntegranteGrupalResponse,
} from '../chats.responses';
import { Estado } from 'src/shared/domain/enums';
import { ChatsMapper } from 'src/modules/chats/application/chats.mapper';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import type { IArchivosService } from 'src/modules/archivos/application/archivos.service.interface';
import { UsuariosUtils } from 'src/modules/usuarios/application/usuarios.utils';

@Injectable()
export class CrearChatGrupal {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject('IIntegranteRepository')
    private readonly integranteRepository: IIntegranteRepository,
    @Inject()
    private readonly usuariosUtils: UsuariosUtils,
    @Inject('IArchivosService')
    private readonly archivosService: IArchivosService,
  ) {}

  async execute(
    usuario: IUsuario,
    usuarios: { id_usuario: string }[],
    nombre: string,
    descripcion?: string,
    foto?: string,
  ): Promise<IRespuesta<IChatGrupalResponse>> {
    // Validar que todos los usuarios existen
    for (const usuario of usuarios) {
      const exite = await this.usuarioRepository.existsById(usuario.id_usuario);
      if (!exite) {
        return crearRespuesta({
          success: false,
          error: `Usuario con ID ${usuario.id_usuario} no encontrado`,
        });
      }
    }

    let link_foto: string | null = null;
    let id_foto: string | null = null;

    if (foto) {
      const archivoResponse = await this.archivosService.saveImagen(foto);
      link_foto = archivoResponse.data?.link || null;
      id_foto = archivoResponse.data?.id_archivo || null;
    }

    // Crear el chat grupal
    const nuevoChat = await this.chatRepository.create({
      id_foto: id_foto,
      nombre: nombre,
      descripcion: descripcion || null,
      is_group: true,
      cantidad_integrantes: usuarios.length + 1,
    });

    // Preparar los integrantes con el administrador marcado
    const todosLosUsuarios = [{ id_usuario: usuario._id }, ...usuarios];
    const integrantes = todosLosUsuarios.map((i) => ({
      id_usuario: i.id_usuario,
      is_admin: i.id_usuario === usuario._id,
    }));

    // Registrar los integrantes
    const newIntegrantes = await this.integranteRepository.registerIntegrantes(
      nuevoChat._id,
      integrantes,
    );

    // Obtener los integrantes con información de usuarios para la respuesta
    const integrantesResponse: IIntegranteGrupalResponse[] = [];
    for (const i of newIntegrantes) {
      const usuarioResponse = await this.usuariosUtils.getUsuarioResponseById(
        i.id_usuario,
      );
      integrantesResponse.push({
        ...usuarioResponse!,
        is_admin: i.id_usuario == usuario._id,
        fecha_union: i.createdAt,
        estado: Estado.HABILITADO,
      });
    }

    // Retornar el chat creado usando el mapper
    const chatResponse = ChatsMapper.toChatGrupalResponse(
      nuevoChat,
      integrantesResponse,
      [], // historial_mensajes
      null, // ultimo_mensaje
      link_foto, // link_foto
      Estado.HABILITADO, // estado_miembro (el creador siempre está habilitado)
    );

    return crearRespuesta({
      success: true,
      data: chatResponse,
    });
  }
}
