import { Inject, Injectable } from '@nestjs/common';
import type {
  IChatRepository,
  IIntegranteRepository,
} from '../../infraestructure/chats.repositories.interfaces';
import type {
  IMensajeRepository,
  IViewerRepository,
  IDetalleMensajeRepository,
} from 'src/modules/mensajes/infraestructure/mensajes.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { Estado, TipoEvento } from 'src/shared/domain/enums';
import { EmisorEventos } from 'src/socket/emisor-eventos';

@Injectable()
export class DeleteGroup {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject('IIntegranteRepository')
    private readonly integranteRepository: IIntegranteRepository,
    @Inject('IMensajeRepository')
    private readonly mensajeRepository: IMensajeRepository,
    @Inject('IViewerRepository')
    private readonly viewerRepository: IViewerRepository,
    @Inject('IDetalleMensajeRepository')
    private readonly detalleMensajeRepository: IDetalleMensajeRepository,
    @Inject()
    private readonly emisorEventos: EmisorEventos,
  ) {}

  async execute(id_chat: string, id_usuario: string): Promise<IRespuesta<any>> {
    try {
      // Verificar que el chat existe
      const chat = await this.chatRepository.findById(id_chat);
      if (!chat) {
        return crearRespuesta({
          success: false,
          error: 'El grupo no existe',
        });
      }

      // Verificar que es un grupo
      if (!chat.is_group) {
        return crearRespuesta({
          success: false,
          error: 'Este chat no es un grupo',
        });
      }

      // Verificar que el usuario es miembro activo del grupo
      const integrante = await this.integranteRepository.findOne({
        id_chat: id_chat,
        id_usuario: id_usuario,
        estado: Estado.HABILITADO,
      });

      if (!integrante) {
        return crearRespuesta({
          success: false,
          error: 'No eres miembro de este grupo',
        });
      }
      if (!integrante.is_admin) {
        return crearRespuesta({
          success: false,
          error: 'No tienes permisos para eliminar este grupo',
        });
      }

      // Obtener todos los mensajes del chat para eliminar su historial
      const mensajes = await this.mensajeRepository.findAllByChatId(id_chat);

      // Eliminar todos los viewers de los mensajes del chat
      for (const mensaje of mensajes) {
        const viewers = await this.viewerRepository.findAll({
          id_mensaje: mensaje._id,
        });
        for (const viewer of viewers) {
          await this.viewerRepository.delete(viewer._id);
        }

        // Eliminar todos los detalles de mensajes (archivos adjuntos)
        const detalles = await this.detalleMensajeRepository.findByMensaje(
          mensaje._id,
        );
        for (const detalle of detalles) {
          await this.detalleMensajeRepository.delete(detalle._id);
        }

        // Eliminar el mensaje
        await this.mensajeRepository.delete(mensaje._id);
      }

      // Obtener todos los integrantes del grupo antes de eliminarlo
      const todosLosIntegrantes = await this.integranteRepository.findAll({
        id_chat: id_chat,
        estado: Estado.HABILITADO,
      });

      // Deshabilitar todos los integrantes del grupo
      for (const integrante of todosLosIntegrantes) {
        await this.integranteRepository.update(integrante._id, {
          estado: Estado.DESHABILITADO,
        });
      }

      // Eliminar/deshabilitar el grupo
      await this.chatRepository.deleteGroup(id_chat);

      // Obtener información de todos los usuarios para notificarles
      const usuariosIds = todosLosIntegrantes.map(
        (integrante) => integrante.id_usuario,
      );

      // Emitir evento de socket para notificar que el grupo fue eliminado
      this.emisorEventos.emit(TipoEvento.GRUPO_ELIMINADO, {
        id_chat: id_chat,
        usuarios_afectados: usuariosIds,
        nombre_grupo: 'Grupo eliminado', // Podrías obtener el nombre real del grupo si lo necesitas
      });

      return crearRespuesta({
        success: true,
        data: {
          message: 'Grupo y su historial de mensajes eliminados exitosamente',
        },
      });
    } catch (error) {
      console.error('Error en DeleteGroup:', error);
      return crearRespuesta({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  }
}
