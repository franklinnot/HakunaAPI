import { IBaseRepository } from 'src/shared/infraestructure/repository/base.repository.interface';
import {
  IMensaje,
  IDetalleMensaje,
  IViewer,
} from '../domain/mensajes.entities';

export interface IMensajeRepository extends IBaseRepository<IMensaje> {
  findAllByChatId(id_chat: string): Promise<IMensaje[]>;
  findUltimoMensajeByChatId(id_chat: string): Promise<IMensaje | null>;
}

export interface IViewerRepository extends IBaseRepository<IViewer> {
  registrarViewers(
    id_mensaje: string,
    integrantes: { id_integrante: string; visto: boolean }[],
  ): Promise<IViewer[]>;
}

export interface IDetalleMensajeRepository
  extends IBaseRepository<IDetalleMensaje> {
  findByMensaje(id_mensaje: string): Promise<IDetalleMensaje[]>;
}
