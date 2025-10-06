import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseDocument } from "src/shared/domain/persistence/base.document";

@Schema({collection: 'chat', timestamps: true})

export class Chat extends BaseDocument {
    @Prop({type: String, required: true, default: null})
    nombre: string;

    @Prop({type: String, required: true, default: null})
    descripcion: string;

    @Prop({type: Boolean, required: true, default: false})
    is_group: boolean;

} 

    
export const ChatSchema = SchemaFactory.createForClass(Chat);

// Relación virtual con Integrante
ChatSchema.virtual('integrantes', {
    ref: 'Integrante',
    localField: '_id',
    foreignField: 'id_chat',    
});

ChatSchema.set('toJSON', { virtuals: true });

    
