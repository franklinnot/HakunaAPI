import { IUsuarioResponse } from 'src/modules/usuarios/application/usuarios.responses';
import { Estado } from 'src/shared/domain/enums';
import { IMensajeResponse } from 'src/modules/mensajes/application/mensajes.responses';

export type IIntegrantePrivadoResponse = {
  id_integrante: string;
} & IUsuarioResponse;

export interface IChatPrivadoResponse {
  id_chat: string;
  historial_mensajes: IMensajeResponse[] | null;
  createdAt: Date;
  id_integranteA: string;
  integranteB: IIntegrantePrivadoResponse;
}

//

export type IIntegranteGrupalResponse = {
  id_integrante: string;
  is_admin: boolean;
  fecha_union: Date;
  estado: Estado;
} & IUsuarioResponse;

export interface IChatGrupalResponse {
  id_chat: string;
  historial_mensajes: IMensajeResponse[] | null;
  createdAt: Date;
  link_foto: string | null;
  nombre: string;
  descripcion: string;
  integrantes: IIntegranteGrupalResponse[];
  cantidad_integrantes: number;
}
