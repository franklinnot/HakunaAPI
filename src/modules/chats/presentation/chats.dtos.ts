import { IsBase64, IsNotEmpty, IsOptional, IsString, ValidateIf, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class IntegranteDto {
  @IsString()
  @IsNotEmpty()
  id_usuario: string;
}

export class CreateChatGrupalDto {
  @ValidateIf((o) => o.foto !== undefined && o.foto !== null)
  @IsBase64()
  foto?: string | null;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IntegranteDto)
  integrantes: IntegranteDto[];
}

export class UpdateChatGrupalDto {
  @ValidateIf((o) => o.foto !== undefined && o.foto !== null)
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
