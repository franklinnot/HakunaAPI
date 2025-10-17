import { IsString, IsNotEmpty, IsOptional, IsBase64 } from 'class-validator';
import { TipoArchivo } from 'src/shared/domain/enums';

export class ArchivoDto {
  @IsString()
  @IsOptional()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  tipoArchivo: TipoArchivo;

  @IsBase64()
  @IsNotEmpty()
  b64: string;
}

export class CreateMensajeDto {
  @IsString()
  @IsNotEmpty()
  id_integrante: string;

  @IsString()
  @IsOptional()
  descripcion: string;

  @IsOptional()
  archivos: ArchivoDto[];
}
