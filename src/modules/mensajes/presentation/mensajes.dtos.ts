import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsBase64,
} from 'class-validator';

export class CreateMensajeDto {
  @IsString()
  @IsNotEmpty()
  id_integrante: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsBoolean()
  @IsNotEmpty()
  has_files: boolean;

  @IsBase64()
  @IsOptional()
  archivos: string[];
}
