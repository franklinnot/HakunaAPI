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
export class CrearChatGrupalUseCase {
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
    foto: string | null,
    nombre: string,
    descripcion: string,
    id_usuarioAdmin: string,
    usuarios: { id_usuario: string }[],
  ): Promise<IRespuesta<IChatGrupalResponse>> {
    try {
      // Validar que el usuario administrador existe
      const usuarioAdmin = await this.usuariosService.getUsuarioById(id_usuarioAdmin);
      if (!usuarioAdmin.success || !usuarioAdmin.data) {
        return crearRespuesta({
          success: false,
          error: 'Usuario administrador no encontrado',
        });
      }

      // Validar que todos los usuarios existen
      const todosLosUsuarios = [{ id_usuario: id_usuarioAdmin }, ...usuarios];
      for (const usuario of todosLosUsuarios) {
        const usuarioExiste = await this.usuariosService.getUsuarioById(usuario.id_usuario);
        if (!usuarioExiste.success || !usuarioExiste.data) {
          return crearRespuesta({
            success: false,
            error: `Usuario con ID ${usuario.id_usuario} no encontrado`,
          });
        }
      }

      // Procesar la foto si se proporciona
      let id_foto_procesada: string | null = null;
      if (foto) {
        const resultadoFoto = await this.actualizarFotoGrupal.procesarFoto(foto);
        if (resultadoFoto.success && resultadoFoto.data) {
          id_foto_procesada = resultadoFoto.data;
        }
      }

      // Crear el chat grupal
      const nuevoChat = await this.chatRepository.create({
        id_foto: id_foto_procesada,
        nombre: nombre,
        descripcion: descripcion,
        is_group: true,
        cantidad_integrantes: todosLosUsuarios.length,
        estado: Estado.HABILITADO,
      });

      if (!nuevoChat) {
        return crearRespuesta({
          success: false,
          error: 'Error al crear el chat grupal',
        });
      }

      // Preparar los integrantes con el administrador marcado
      const integrantesParaRegistrar = todosLosUsuarios.map((usuario) => ({
        id_usuario: usuario.id_usuario,
        is_admin: usuario.id_usuario === id_usuarioAdmin,
      }));

      // Registrar los integrantes
      await this.integranteRepository.registerIntegrantes(
        nuevoChat._id,
        integrantesParaRegistrar,
      );

      // Obtener los integrantes con información de usuarios para la respuesta
      const integrantesResponse: IIntegranteGrupalResponse[] = [];
      for (const usuario of todosLosUsuarios) {
        const usuarioData = await this.usuariosService.getUsuarioById(usuario.id_usuario);
        if (usuarioData.success && usuarioData.data) {
          integrantesResponse.push({
            ...usuarioData.data,
            is_admin: usuario.id_usuario === id_usuarioAdmin,
            fecha_union: nuevoChat.createdAt,
            estado: Estado.HABILITADO,
          });
        }
      }

      // Obtener link de foto del chat creado
      let link_foto_chat: string | null = null;
      
      if (nuevoChat.id_foto) {
        // Ahora siempre será un ID de archivo, buscar el link
        link_foto_chat = await this.archivoRepository.findLinkById(nuevoChat.id_foto);
      }

      // Retornar el chat creado usando el mapper
      const chatResponse = ChatsMapper.toChatGrupalResponse(
        nuevoChat,
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
        error: 'Error interno del servidor al crear el chat grupal',
      });
    }
  }
}