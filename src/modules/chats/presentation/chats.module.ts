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
import { GetChatsPrivados } from '../application/use-cases/get-chats-privados';
import { ChatsUtils } from '../application/chats.utils';
import { GetChatPrivado } from '../application/use-cases/get-chat-privado';
import { CrearChatGrupal } from '../application/use-cases/crear-chat-grupal';
import { GetChatsGrupales } from '../application/use-cases/get-chats-grupales';
import { UpdateChatGrupal } from '../application/use-cases/update-chat-grupal/update-chat-grupal';
import { UpdateFotoGrupal } from '../application/use-cases/update-chat-grupal/update-foto-grupal';
import { GetChatGrupal } from '../application/use-cases/get-chat-grupal';

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
    // de utilidad
    ChatsUtils,
    // casos de uso
    CrearChatPrivado,
    GetChatsPrivados,
    GetChatPrivado,
    CrearChatGrupal,
    GetChatsGrupales,
    GetChatGrupal,
    UpdateChatGrupal,
    UpdateFotoGrupal,
    // servicios
    {
      provide: 'IChatsService',
      useClass: ChatsService,
    },
  ],
  exports: [
    'IChatRepository',
    'IIntegranteRepository',
    'IChatsService',
    ChatsUtils,
  ],
  controllers: [ChatsController],
})
export class ChatsModule {}
