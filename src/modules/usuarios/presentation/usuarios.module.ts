import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Usuario,
  UsuarioSchema,
} from '../infraestructure/schemas/usuario.schema';
import { UsuarioRepository } from '../infraestructure/repositories/usuario.repository';
import { UsuariosService } from '../application/usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { ArchivosModule } from 'src/modules/archivos/presentation/archivos.module';
import { UpdateUsuario } from '../application/use-cases/update-usuario/update-usuario';
import { DisableUsuario } from '../application/use-cases/disable-usuario';
import { ExisteUsuarioPorUsername } from '../application/use-cases/existe-usuario-por-username';
import { GetUsuariosPorNombreOUsername } from '../application/use-cases/get-users-by-name-or-username';
import { UsuariosUtils } from '../application/usuarios.utils';
import { CrearUsuario } from '../application/use-cases/crear-usuario';
import { UpdateFotoPerfil } from '../application/use-cases/update-usuario/update-foto-perfil';

@Module({
  imports: [
    ArchivosModule,
    // modelos y schemas
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
  ],
  providers: [
    // repositorios
    {
      provide: 'IUsuarioRepository',
      useClass: UsuarioRepository,
    },
    // de utilidad
    UsuariosUtils,
    // casos de uso
    CrearUsuario,
    ExisteUsuarioPorUsername,
    UpdateFotoPerfil,
    UpdateUsuario,
    DisableUsuario,
    GetUsuariosPorNombreOUsername,
    // servicio
    {
      provide: 'IUsuariosService',
      useClass: UsuariosService,
    },
  ],
  exports: ['IUsuarioRepository', 'IUsuariosService', UsuariosUtils],
  controllers: [UsuariosController],
})
export class UsuariosModule {}
