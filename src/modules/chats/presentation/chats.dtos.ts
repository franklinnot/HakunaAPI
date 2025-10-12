import { IsBase64, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChatGrupalDto {
  @IsOptional()
  @IsBase64()
  foto: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion: string;

  @IsString({ each: true })
  @IsNotEmpty()
  integrantes: { id_usuario: string }[];
}
