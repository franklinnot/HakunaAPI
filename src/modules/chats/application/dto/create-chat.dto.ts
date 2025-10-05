import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateChatDto {

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsNotEmpty()
    @IsBoolean()
    is_group: boolean;

    @IsOptional()
    userAId?: string;

    @IsOptional()
    userBId?: string;
}