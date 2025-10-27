/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Logger } from '@nestjs/common';
import { AuthSocketService } from 'src/modules/auth/application/auth.socket.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class AppSocket implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('AppGateway');
  private userSockets = new Map<string, Set<string>>();

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
        socket.data.user = user; // útil para eventos futuros

        if (!this.userSockets.has(user._id)) {
          this.userSockets.set(user._id, new Set());
        }
        this.userSockets.get(user._id)!.add(socket.id);

        this.logger.log(`Usuario ${user.username} conectado`);
      } else {
        socket.disconnect();
      }
    } catch {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const userEntry = [...this.userSockets.entries()].find(([_, sockets]) =>
      sockets.has(socket.id),
    );

    if (userEntry) {
      const [userId, sockets] = userEntry;
      sockets.delete(socket.id);

      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
      this.logger.log(
        `Usuario ${socket.data.user?.username ?? userId} desconectado`,
      );
    } else {
      this.logger.log(
        `Socket ${socket.id} desconectado, usuario no encontrado.`,
      );
    }
  }

  /** Emitir a todos las conexiones de un usuario */
  emitToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;
    for (const socketId of sockets) {
      this.server.to(socketId).emit(event, data);
    }
  }

  /** Emitir a varios usuarios a la vez */
  emitToUsers(userIds: string[], event: string, data: any) {
    for (const id of userIds) this.emitToUser(id, event, data);
  }

  /** Emitir a todos (una notificación global) */
  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  getServer() {
    return this.server;
  }
}
