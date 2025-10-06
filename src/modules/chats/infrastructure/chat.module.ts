import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Chat, ChatSchema } from '../domain/schemas/chat.schema';
import { Integrante, IntegranteSchema } from '../domain/schemas/integrante.schema';
import { ChatController } from "./chat.controller";
import { ChatService } from "../application/chat.service";
import { ChatRepository } from "../domain/repositories/chat.repository";
import { Usuario, UsuarioSchema } from "src/modules/usuarios/domain/schemas/usuario.schema";

@Module({
    imports:[
        MongooseModule.forFeature([
            { name: Chat.name, schema: ChatSchema},
            { name: Integrante.name, schema: IntegranteSchema},
            { name: Usuario.name, schema: UsuarioSchema},
        ])
    ],
    controllers: [ChatController],
    providers: [ChatService, ChatRepository],
    exports: [ChatRepository],
}) 
export class ChatModule{}
