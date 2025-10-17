import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import type { IChatRepository } from 'src/modules/chats/infraestructure/chats.repositories.interfaces';
import type { IIntegranteRepository } from 'src/modules/chats/infraestructure/chats.repositories.interfaces';
import { Estado, TipoArchivo } from 'src/shared/domain/enums';
import type {
  IDetalleMensajeRepository,
  IMensajeRepository,
  IViewerRepository,
} from 'src/modules/mensajes/infraestructure/mensajes.repositories.interfaces';
import { IMensajeResponse } from './mensajes.responses';
import type { IArchivosService } from 'src/modules/archivos/application/archivos.service.interface';
import { IArchivoResponse } from 'src/modules/archivos/application/archivos.responses';

export interface ICrearArchivo {
  nombre?: string;
  tipoArchivo: TipoArchivo;
  b64: string;
}

@Injectable()
export class CrearMensaje {
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
    private readonly detalleRepository: IDetalleMensajeRepository,
    @Inject('IArchivosService')
    private readonly archivosService: IArchivosService,
  ) {}

  async execute(
    id_integrante: string,
    descripcion?: string,
    archivos?: ICrearArchivo[],
  ): Promise<IRespuesta<IMensajeResponse>> {
    if (!descripcion && !archivos) {
      return crearRespuesta({
        success: false,
        error: 'Solicitud inválida.',
      });
    }

    const integrante = await this.integranteRepository.findById(id_integrante);
    if (!integrante || integrante.estado == Estado.DESHABILITADO) {
      return crearRespuesta({
        success: false,
        error: 'El integrante no puede enviar mensajes.',
      });
    }

    const chat = await this.chatRepository.findById(integrante.id_chat);
    let integrantes = await this.integranteRepository.findAllByIdChat(
      chat!._id,
    );
    integrantes = integrantes.filter((i) => i.estado == Estado.HABILITADO);

    const has_files = archivos ? true : false;
    const nuevo_mensaje = await this.mensajeRepository.create({
      id_integrante: id_integrante,
      descripcion: descripcion || null,
      has_files: has_files,
    });

    for (const integrante of integrantes) {
      await this.viewerRepository.create({
        id_integrante: integrante._id,
        id_mensaje: nuevo_mensaje._id,
        visto: integrante._id == id_integrante ? true : false,
      });
    }

    const detalles: IArchivoResponse[] = [];
    if (has_files) {
      for (const archivo of archivos!) {
        if (archivo.tipoArchivo == TipoArchivo.IMAGEN) {
          const rpta = await this.archivosService.guardarImagen(
            archivo.b64,
            archivo.nombre || null,
          );
          if (rpta.data) {
            const archivo = rpta.data;
            detalles.push(archivo);
            await this.detalleRepository.create({
              id_mensaje: nuevo_mensaje._id,
              id_archivo: archivo.id_archivo,
            });
          }
        }
      }
    }

    return crearRespuesta({
      success: true,
      data: {
        id_mensaje: nuevo_mensaje._id,
        id_integrante: integrante._id,
        descripcion: descripcion || null,
        has_files: has_files,
        createdAt: nuevo_mensaje.createdAt,
        archivos: detalles,
        estado: nuevo_mensaje.estado,
      },
    });
  }
}
