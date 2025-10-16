import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Archivo,
  ArchivoSchema,
} from 'src/modules/archivos/infraestructure/schemas/archivo.schema';
import { ArchivoRepository } from '../infraestructure/repositories/archivo.repository';
import { ArchivosService } from 'src/modules/archivos/application/archivos.service';
import { ArchivosUtils } from '../application/archivos.utils';
import { GuardarImagen } from '../application/use-cases/guardar-imagen';
import { StorageService } from '../application/storage.service';
import { ActualizarImagen } from '../application/use-cases/actualizar-imagen';
import { EliminarImagen } from '../application/use-cases/eliminar-imagen';

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
    StorageService,
    ArchivosUtils,
    GuardarImagen,
    ActualizarImagen,
    EliminarImagen,
    {
      provide: 'IArchivosService',
      useClass: ArchivosService,
    },
  ],
  exports: ['IArchivoRepository', 'IArchivosService'],
})
export class ArchivosModule {}
