import { IsString, MinLength, IsBase64, IsOptional } from 'class-validator';

export class UpdateUsuarioDto {
  @IsBase64()
  @IsOptional()
  foto?: string | null;

  @IsString()
  @IsOptional()
  @MinLength(2)
  nombre?: string | null;

  @IsString()
  @IsOptional()
  @MinLength(2)
  username?: string | null;
}
