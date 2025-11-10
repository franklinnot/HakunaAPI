import { Inject, Injectable } from '@nestjs/common';
import { IChat } from '../domain/chats.entities';
import { IIntegranteGrupalResponse } from './chats.responses';
import type { IIntegranteRepository, IChatRepository } from '../infraestructure/chats.repositories.interfaces';
import { UsuariosUtils } from 'src/modules/usuarios/application/usuarios.utils';
import { Estado } from 'src/shared/domain/enums';

@Injectable()
export class ChatsUtils {
  constructor(
    @Inject('IIntegranteRepository')
    private readonly integranteRepository: IIntegranteRepository,
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject()
    private readonly usuariosUtils: UsuariosUtils,
  ) {}

  async getIntegrantesResponseByChat(
    chat: IChat,
  ): Promise<IIntegranteGrupalResponse[]> {
    // obtener integrantes
    const integrantes = await this.integranteRepository.findAll({
      id_chat: chat._id,
      estado: Estado.HABILITADO,
    });

    const integrantesResponse: IIntegranteGrupalResponse[] = [];

    // Obtener información de cada integrante
    for (const i of integrantes) {
      const usuarioResponse = await this.usuariosUtils.getUsuarioResponseById(
        i.id_usuario,
      );

      integrantesResponse.push({
        is_admin: i.is_admin,
        fecha_union: i.createdAt,
        estado: i.estado,
        ...usuarioResponse!,
      });
    }

    return integrantesResponse;
  }

  /**
   * Sincroniza el campo cantidad_integrantes en la base de datos
   * con la cantidad real de integrantes activos (HABILITADO)
   */
  async sincronizarCantidadIntegrantes(id_chat: string): Promise<void> {
    // Contar integrantes activos
    const integrantesActivos = await this.integranteRepository.findAll({
      id_chat: id_chat,
      estado: Estado.HABILITADO,
    });

    // Actualizar el campo en la base de datos
    await this.chatRepository.update(id_chat, {
      cantidad_integrantes: integrantesActivos.length,
    });
  }
}
