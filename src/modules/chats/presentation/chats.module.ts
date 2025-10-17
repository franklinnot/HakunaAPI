import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from '../infraestructure/schemas/chat.schema';
import {
  Integrante,
  IntegranteSchema,
} from 'src/modules/chats/infraestructure/schemas/integrante.schema';
import { ChatRepository } from 'src/modules/chats/infraestructure/repositories/chat.repository';
import { IntegranteRepository } from 'src/modules/chats/infraestructure/repositories/integrante.repository';
import { ChatsService } from '../application/chats.service';
import { ChatsController } from './chats.controller';
import { ArchivosModule } from 'src/modules/archivos/presentation/archivos.module';
import { UsuariosModule } from 'src/modules/usuarios/presentation/usuarios.module';
import { MensajesModule } from 'src/modules/mensajes/presentation/mensajes.module';
import { CrearChatPrivado } from '../application/use-cases/crear-chat-privado';
import { BuscarChatsPrivados } from '../application/use-cases/get-chats-privados';
import { ChatsUtils } from '../application/chats.utils';
import { GetMensajesPrivados } from 'src/modules/mensajes/application/use-cases/get-mensajes-privados';

@Module({
  imports: [
    ArchivosModule,
    UsuariosModule,
    forwardRef(() => MensajesModule),
    // modelos y schemas
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Integrante.name, schema: IntegranteSchema },
    ]),
  ],
  providers: [
    // repositorios
    {
      provide: 'IChatRepository',
      useClass: ChatRepository,
    },
    {
      provide: 'IIntegranteRepository',
      useClass: IntegranteRepository,
    },
    // servicios
    ChatsUtils,
    CrearChatPrivado,
    BuscarChatsPrivados,
    GetMensajesPrivados,
    {
      provide: 'IChatsService',
      useClass: ChatsService,
    },
  ],
  exports: ['IChatRepository', 'IIntegranteRepository', 'IChatsService'],
  controllers: [ChatsController],
})
export class ChatsModule {}
