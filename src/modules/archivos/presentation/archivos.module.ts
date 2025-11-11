import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Archivo,
  ArchivoSchema,
} from 'src/modules/archivos/infraestructure/schemas/archivo.schema';
import { ArchivoRepository } from '../infraestructure/repositories/archivo.repository';
import { ArchivosService } from 'src/modules/archivos/application/archivos.service';
import { ArchivosUtils } from '../application/archivos.utils';
import { SaveImagen } from '../application/use-cases/save-imagen';
import { StorageService } from '../application/storage.service';
import { UpdateImagen } from '../application/use-cases/update-imagen';
import { DeleteArchivo } from '../application/use-cases/delete-archivo';
import { SaveDocumento } from '../application/use-cases/save-documento';
import { SaveAudio } from '../application/use-cases/save-audio';
import { CreateArchivo } from '../application/use-cases/create-archivo';

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
    // casos de uso
    StorageService,
    ArchivosUtils,
    DeleteArchivo,
    CreateArchivo,
    SaveImagen,
    UpdateImagen,
    SaveDocumento,
    SaveAudio,
    // servicio
    {
      provide: 'IArchivosService',
      useClass: ArchivosService,
    },
  ],
  exports: ['IArchivoRepository', 'IArchivosService'],
})
export class ArchivosModule {}
