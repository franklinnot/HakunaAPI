import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseDocument } from "src/shared/domain/persistence/base.document";
import { Chat } from "./chat.schema";

@Schema({collection: 'integrante',  timestamps: true})
export class Integrante extends BaseDocument {
    
    @Prop({type: Types.ObjectId, ref: 'Chat', required: true})
    id_chat: Types.ObjectId;

    @Prop({type: Types.ObjectId, ref: 'Usuario', required: true})
    id_usuario: string;

    @Prop({type: Boolean, required: true, default: false})
    is_admin: boolean;

}

export const IntegranteSchema = SchemaFactory.createForClass(Integrante);