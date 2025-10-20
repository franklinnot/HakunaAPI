import { IRespuesta } from 'src/shared/application/response';
import { IMensajeResponse } from './mensajes.responses';
import { ICrearArchivo } from './use-cases/send-mensaje-privado';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';

export interface IMensajesService {
  sendMensajePrivado(
    usuario: IUsuario,
    id_usuarioB: string,
    descripcion?: string,
    archivos?: ICrearArchivo[],
  ): Promise<IRespuesta<IMensajeResponse>>;
  getMensajesPrivados(
    id_usuario: string,
    id_chat: string,
  ): Promise<IRespuesta<IMensajeResponse[]>>;
  getMensajesGrupales(
    id_usuario: string,
    id_chat: string,
  ): Promise<IRespuesta<IMensajeResponse[]>>;
}
