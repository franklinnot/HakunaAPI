import { IsString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsOptional()
  id_fotoPerfil?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
