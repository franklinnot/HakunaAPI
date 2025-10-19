import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IChatGrupalResponse } from '../chats.responses';
import type { IChatRepository } from '../../infraestructure/chats.repositories.interfaces';
import type { IIntegranteRepository } from '../../infraestructure/chats.repositories.interfaces';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import { UsuariosMapper } from 'src/modules/usuarios/application/usuarios.mapper';
import { Estado } from 'src/shared/domain/enums';

@Injectable()
export class BuscarChatsGrupales {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject('IIntegranteRepository')
    private readonly integranteRepository: IIntegranteRepository,
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(id_usuario: string): Promise<IRespuesta<IChatGrupalResponse[]>> {
    try {
      const chatsGrupales = await this.chatRepository.findChatsGrupalesByIdUsuario(id_usuario);

      const chatsGrupalesResponse: IChatGrupalResponse[] = await Promise.all(
        chatsGrupales.map(async (chat) => {
          // Obtener integrantes del chat
          const integrantes = await this.integranteRepository.findAllByIdChat(chat._id);
          
          // Obtener información de cada integrante
          const integrantesResponse = await Promise.all(
            integrantes.map(async (integrante) => {
              const usuario = await this.usuarioRepository.findById(integrante.id_usuario);
              const link_foto = await this.archivoRepository.findLinkById(usuario!.id_foto || '');
              
              return {
                ...UsuariosMapper.toUsuarioResponse(usuario!, link_foto),
                is_admin: integrante.is_admin,
                fecha_union: integrante.createdAt,
                estado: integrante.estado,
              };
            })
          );

          // Obtener link de foto del chat
          let link_foto_chat: string | null = null;
          
          if (chat.id_foto) {
            // Verificar si ya tiene el prefijo data:
            if (chat.id_foto.startsWith('data:')) {
              // Ya tiene el prefijo completo, usar directamente
              link_foto_chat = chat.id_foto;
            } else if (chat.id_foto.length > 50 && /^[A-Za-z0-9+/=]+$/.test(chat.id_foto)) {
              // Es una imagen base64 sin prefijo (cadena larga que solo contiene caracteres base64)
              link_foto_chat = `data:image/jpeg;base64,${chat.id_foto}`;
            } else {
              // Es un ID de archivo, buscar el link
              link_foto_chat = await this.archivoRepository.findLinkById(chat.id_foto);
            }
          }

          return {
            id_chat: chat._id,
            historial_mensajes: null, // Se puede implementar después
            createdAt: chat.createdAt,
            link_foto: link_foto_chat,
            nombre: chat.nombre || '',
            descripcion: chat.descripcion || '',
            integrantes: integrantesResponse,
            cantidad_integrantes: chat.cantidad_integrantes,
          };
        })
      );

      return crearRespuesta({
        success: true,
        data: chatsGrupalesResponse,
      });
    } catch (error) {
      return crearRespuesta({
        success: false,
        error: 'Error al obtener los chats grupales',
        data: [],
      });
    }
  }
}