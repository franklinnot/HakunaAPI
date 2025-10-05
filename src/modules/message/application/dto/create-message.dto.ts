import { IsString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMensajeDto {
  @IsString()
  @IsNotEmpty()
  id_integrante: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsNotEmpty()
  has_files: boolean;

}
