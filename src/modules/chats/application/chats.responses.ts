import { IUsuarioResponse } from 'src/modules/usuarios/application/usuarios.responses';
import { Estado } from 'src/shared/domain/enums';
import { IMensajeResponse } from 'src/modules/mensajes/application/mensajes.responses';

export interface IChatPrivadoResponse {
  id_chat: string;
  historial_mensajes: IMensajeResponse[] | null;
  createdAt: Date;
  usuarioB: IUsuarioResponse;
  ultimo_mensaje?: IMensajeResponse;
}

//

export type IIntegranteGrupalResponse = {
  is_admin: boolean;
  fecha_union: Date;
  estado: Estado;
} & IUsuarioResponse;

export interface IChatGrupalResponse {
  id_chat: string;
  historial_mensajes: IMensajeResponse[] | null;
  ultimo_mensaje?: IMensajeResponse;
  createdAt: Date;
  link_foto: string | null;
  nombre: string;
  descripcion: string;
  integrantes: IIntegranteGrupalResponse[];
  cantidad_integrantes: number;
}
