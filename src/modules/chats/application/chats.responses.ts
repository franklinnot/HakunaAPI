import { IUsuarioResponse } from 'src/modules/usuarios/application/usuarios.responses';
import { Estado } from 'src/shared/domain/enums';
import { IMensajeResponse } from 'src/modules/mensajes/application/mensajes.responses';

export interface IChatResponse {
  id_chat: string;
  historial_mensajes: IMensajeResponse[];
  createdAt: Date;
  ultimo_mensaje: IMensajeResponse | null;
  is_group: boolean;
}

//

export interface IChatPrivadoResponse extends IChatResponse {
  usuarioB: IUsuarioResponse;
}

//

export type IIntegranteGrupalResponse = {
  is_admin: boolean;
  fecha_union: Date;
  estado: Estado;
} & IUsuarioResponse;

export interface IChatGrupalResponse extends IChatResponse {
  link_foto: string | null;
  nombre: string;
  descripcion: string | null;
  integrantes: IIntegranteGrupalResponse[];
  cantidad_integrantes: number;
  estado_miembro: Estado; // Estado del usuario actual en el grupo
}
