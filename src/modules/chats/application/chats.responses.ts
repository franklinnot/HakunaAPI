import { IUsuarioResponse } from 'src/modules/usuarios/application/usuarios.responses';
import { Estado } from 'src/shared/domain/enums';
import { IMensajeResponse } from 'src/modules/mensajes/application/mensajes.responses';

export interface IChatPrivadoResponse {
  id_chat: string;
  historial_mensajes: IMensajeResponse[];
  createdAt: Date;
  usuarioB: IUsuarioResponse;
  ultimo_mensaje: IMensajeResponse | null;
}

//

export type IIntegranteGrupalResponse = {
  is_admin: boolean;
  fecha_union: Date;
  estado: Estado;
} & IUsuarioResponse;

export interface IChatGrupalResponse {
  id_chat: string;
  historial_mensajes: IMensajeResponse[];
  ultimo_mensaje: IMensajeResponse | null;
  createdAt: Date;
  link_foto: string | null;
  nombre: string;
  descripcion: string | null;
  integrantes: IIntegranteGrupalResponse[];
  cantidad_integrantes: number;
}
