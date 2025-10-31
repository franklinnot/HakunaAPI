import { Inject, Injectable } from '@nestjs/common';
import { IRespuesta } from 'src/shared/application/response';
import { IMensajesService } from './mensajes.service.interface';
import {
  IMensajeGrupalResponse,
  IMensajePrivadoResponse,
  IMensajeResponse,
} from './mensajes.responses';
import {
  SendMensajePrivado,
  ICrearArchivo,
} from './use-cases/send-mensaje-privado';
import { SendMensajeGrupal } from './use-cases/send-mensaje-grupal';
import { GetMensajesPrivados } from './use-cases/get-mensajes-privados';
import { GetMensajesGrupales } from './use-cases/get-mensajes-grupales';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';

@Injectable()
export class MensajesService implements IMensajesService {
  constructor(
    @Inject()
    private readonly sendMensajePrivadoCU: SendMensajePrivado,
    @Inject()
    private readonly sendMensajeGrupalCU: SendMensajeGrupal,
    @Inject()
    private readonly getMensajesPrivadosCU: GetMensajesPrivados,
    @Inject()
    private readonly getMensajesGrupalesCU: GetMensajesGrupales,
  ) {}

  async sendMensajePrivado(
    usuario: IUsuario,
    id_usuarioB: string,
    descripcion?: string,
    archivos?: ICrearArchivo[],
  ): Promise<IRespuesta<IMensajePrivadoResponse>> {
    return await this.sendMensajePrivadoCU.execute(
      usuario,
      id_usuarioB,
      descripcion,
      archivos,
    );
  }

  async getMensajesPrivados(
    id_usuario: string,
    id_chat: string,
  ): Promise<IRespuesta<IMensajeResponse[]>> {
    return await this.getMensajesPrivadosCU.execute(id_usuario, id_chat);
  }

  async sendMensajeGrupal(
    usuario: IUsuario,
    id_chat: string,
    descripcion?: string,
    archivos?: ICrearArchivo[],
  ): Promise<IRespuesta<IMensajeGrupalResponse>> {
    return await this.sendMensajeGrupalCU.execute(
      usuario,
      id_chat,
      descripcion,
      archivos,
    );
  }

  async getMensajesGrupales(
    id_usuario: string,
    id_chat: string,
  ): Promise<IRespuesta<IMensajeResponse[]>> {
    return await this.getMensajesGrupalesCU.execute(id_usuario, id_chat);
  }
}
