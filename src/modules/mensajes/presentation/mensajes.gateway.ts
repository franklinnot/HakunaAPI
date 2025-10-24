import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Logger } from '@nestjs/common';
import { AuthSocketService } from 'src/modules/auth/application/auth.socket.service';
import { OnEvent } from '@nestjs/event-emitter';
import { IMensajeResponse } from '../application/mensajes.responses';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class MensajesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('MensajesGateway');
  private userSockets = new Map<string, string>();

  constructor(
    @Inject()
    private readonly authSocketService: AuthSocketService,
  ) {}

  async handleConnection(socket: Socket) {
    const token =
      (socket.handshake.auth?.token as string) ||
      socket.handshake.headers.authorization?.split(' ')[1];
    if (!token) {
      this.logger.warn('Conexión rechazada: no se envió token');
      return socket.disconnect();
    }

    try {
      const result = await this.authSocketService.validateToken(token);
      if (result.success && result.data) {
        const user = result.data;
        this.userSockets.set(user._id, socket.id);
        socket.data.user = user; // útil para eventos futuros
        this.logger.log(`Usuario ${user.username} conectado`);
      } else {
        socket.disconnect();
      }
    } catch {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = [...this.userSockets.entries()].find(
      ([_, sid]) => sid === socket.id,
    )?.[0];
    if (userId) this.userSockets.delete(userId);
    this.logger.log(`Usuario ${userId ?? 'desconocido'} desconectado`);
  }

  @OnEvent('send-mensaje-privado')
  handleNuevoMensajePrivado(payload: {
    idUsuarioB: string;
    mensaje: IMensajeResponse;
  }) {
    const socketB = this.userSockets.get(payload.idUsuarioB);
    if (socketB) {
      this.server.to(socketB).emit('nuevo_mensaje_privado', payload.mensaje);
      this.logger.log(`Mensaje privado emitido a ${payload.idUsuarioB}`);
    } else {
      this.logger.log(
        `Usuario ${payload.idUsuarioB} no conectado — mensaje no emitido`,
      );
    }
  }
}
