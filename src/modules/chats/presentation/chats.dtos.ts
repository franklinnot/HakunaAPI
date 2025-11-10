import {
  IsBase64,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class IntegranteDto {
  @IsString()
  @IsNotEmpty()
  id_usuario: string;
}

export class CreateChatGrupalDto {
  @IsBase64()
  @IsOptional()
  foto?: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IntegranteDto)
  @IsNotEmpty()
  integrantes: IntegranteDto[];
}

export class UpdateChatGrupalDto {
  @IsBase64()
  @IsOptional()
  foto?: string | null;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  id_usuario: string;
}
