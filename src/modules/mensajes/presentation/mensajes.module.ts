import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Mensaje,
  MensajeSchema,
} from 'src/modules/mensajes/infraestructure/schemas/mensaje.schema';
import {
  Viewer,
  ViewerSchema,
} from 'src/modules/mensajes/infraestructure/schemas/viewer.schema';
import {
  DetalleMensaje,
  DetalleMensajeSchema,
} from 'src/modules/mensajes/infraestructure/schemas/detalle-mensaje.schema';
import { MensajeRepository } from 'src/modules/mensajes/infraestructure/repositories/mensaje.repository';
import { ViewerRepository } from 'src/modules/mensajes/infraestructure/repositories/viewer.repository';
import { DetalleMensajeRepository } from 'src/modules/mensajes/infraestructure/repositories/detalle-mensaje.repository';
import { MensajesService } from 'src/modules/mensajes/application/mensajes.service';
import { MensajesController } from './mensajes.controller';
import { ChatsModule } from 'src/modules/chats/presentation/chats.module';
import { ArchivosModule } from 'src/modules/archivos/presentation/archivos.module';
import { MensajesUtils } from '../application/mensajes.utils';
import { SendMensajePrivado } from '../application/use-cases/send-mensaje-privado';
import { GetMensajesPrivados } from '../application/use-cases/get-mensajes-privados';
import { GetMensajesGrupales } from '../application/use-cases/get-mensajes-grupales';

@Module({
  imports: [
    ArchivosModule,
    forwardRef(() => ChatsModule),
    // modelos y schemas
    MongooseModule.forFeature([
      { name: Mensaje.name, schema: MensajeSchema },
      { name: Viewer.name, schema: ViewerSchema },
      { name: DetalleMensaje.name, schema: DetalleMensajeSchema },
    ]),
  ],
  providers: [
    // repositorios
    {
      provide: 'IMensajeRepository',
      useClass: MensajeRepository,
    },
    {
      provide: 'IViewerRepository',
      useClass: ViewerRepository,
    },
    {
      provide: 'IDetalleMensajeRepository',
      useClass: DetalleMensajeRepository,
    },
    // de utilidad
    MensajesUtils,
    // casos de uso
    SendMensajePrivado,
    GetMensajesPrivados,
    GetMensajesGrupales,
    // servicio
    {
      provide: 'IMensajesService',
      useClass: MensajesService,
    },
  ],
  exports: [
    'IMensajeRepository',
    'IViewerRepository',
    'IDetalleMensajeRepository',
    'IMensajesService',
    MensajesUtils,
  ],
  controllers: [MensajesController],
})
export class MensajesModule {}
