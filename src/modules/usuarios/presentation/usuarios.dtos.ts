import { PartialType } from '@nestjs/mapped-types';
import { RegisterUsuarioDto } from 'src/modules/auth/presentation/auth.dtos';

export class UpdateUsuarioDto extends PartialType(RegisterUsuarioDto) {}
