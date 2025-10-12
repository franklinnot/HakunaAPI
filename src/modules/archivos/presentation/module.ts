import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Archivo,
  ArchivoSchema,
} from 'src/modules/archivos/infraestructure/schemas/archivo.schema';

import { ArchivoRepository } from '../infraestructure/repositories/archivo.repository';
import { ArchivosService } from 'src/modules/archivos/application/archivos.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Archivo.name, schema: ArchivoSchema }]),
  ],
  providers: [
    // repositorios
    {
      provide: 'IArchivoRepository',
      useClass: ArchivoRepository,
    },
    // servicios
    {
      provide: 'IArchivosService',
      useClass: ArchivosService,
    },
  ],
  exports: ['IArchivoRepository', 'IArchivosService'],
})
export class ArchivosModule {}
