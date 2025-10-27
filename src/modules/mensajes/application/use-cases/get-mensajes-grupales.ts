import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { IMensajeResponse } from '../mensajes.responses';
import { Estado } from 'src/shared/domain/enums';
import type { IIntegranteRepository } from 'src/modules/chats/infraestructure/chats.repositories.interfaces';
import type { IMensajeRepository } from 'src/modules/mensajes/infraestructure/mensajes.repositories.interfaces';
import { MensajesUtils } from '../mensajes.utils';

@Injectable()
export class GetMensajesGrupales {
  constructor(
    @Inject('IIntegranteRepository')
    private readonly integranteRepository: IIntegranteRepository,

    @Inject('IMensajeRepository')
    private readonly mensajeRepository: IMensajeRepository,

    @Inject()
    private readonly mensajesUtils: MensajesUtils,
  ) {}

  async execute(
    id_usuario: string,
    id_chat: string,
  ): Promise<IRespuesta<IMensajeResponse[]>> {
    const integrante = await this.integranteRepository.findOne({
      id_chat: id_chat,
      id_usuario: id_usuario,
      estado: Estado.HABILITADO,
    });

    if (!integrante) {
      return crearRespuesta({
        success: false,
        error: 'El usuario no pertenece a este chat grupal.',
      });
    }

    // Obtener todos los mensajes del chat grupal
    const mensajes = await this.mensajeRepository.findAllByChatId(id_chat);

    if (mensajes.length == 0) {
      return crearRespuesta({
        success: true,
        data: [],
      });
    }

    const mensajesResponse: IMensajeResponse[] = [];

    for (const mensaje of mensajes) {
      const integranteEmisor = await this.integranteRepository.findOne({
        _id: mensaje.id_integrante,
      });

      // Obtener archivos asociados (si existen)
      const archivos = mensaje.has_files
        ? await this.mensajesUtils.obtenerDetalles(mensaje._id)
        : [];

      mensajesResponse.push({
        id_mensaje: mensaje._id,
        id_usuario: integranteEmisor!.id_usuario,
        id_chat: id_chat,
        is_group: true,
        descripcion: mensaje.descripcion,
        has_files: mensaje.has_files,
        createdAt: mensaje.createdAt,
        archivos: archivos,
        estado: mensaje.estado,
      });
    }

    return crearRespuesta({
      success: true,
      data: mensajesResponse,
    });
  }
}
