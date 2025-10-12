import { Inject, Injectable } from '@nestjs/common';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';

@Injectable()
export class ArchivosService {
  constructor(
    @Inject('IArchivoRepository')
    private readonly archivoRepository: IArchivoRepository,
  ) {}
}
