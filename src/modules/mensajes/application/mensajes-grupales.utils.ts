import { Inject, Injectable } from '@nestjs/common';
import type { IIntegranteRepository } from 'src/modules/chats/infraestructure/chats.repositories.interfaces';
import { Estado } from 'src/shared/domain/enums';

@Injectable()
export class MensajesGrupalesUtils {
  constructor(
    @Inject('IIntegranteRepository')
    private readonly integranteRepository: IIntegranteRepository,
  ) {}

  async obtenerUsuariosDelChat(idChat: string): Promise<string[]> {
    const integrantes = await this.integranteRepository.findAll({
      id_chat: idChat,
      estado: Estado.HABILITADO,
    });

    return integrantes.map((integrante) => integrante.id_usuario);
  }
}
