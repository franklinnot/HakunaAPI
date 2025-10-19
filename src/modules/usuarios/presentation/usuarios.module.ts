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
import { ActualizarUsuario } from '../application/use-cases/actualizar-usuario';
import { DeshabilitarUsuario } from '../application/use-cases/disable-usuario';
import { ExisteUsuarioPorUsername } from '../application/use-cases/existe-usuario-por-username';
import { BuscarUsuariosPorNombreOUsername } from '../application/use-cases/get-users-by-name-or-username';
import { GetUsuarioById } from '../application/use-cases/get-usuario-by-id';
import { RegistrarUsuario } from '../application/use-cases/registrar-usuario';
import { ActualizarFotoPerfil } from '../application/use-cases/actualizar-foto-perfil';

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
    // servicios
    ActualizarUsuario,
    DeshabilitarUsuario,
    ExisteUsuarioPorUsername,
    BuscarUsuariosPorNombreOUsername,
    GetUsuarioById,
    RegistrarUsuario,
    ActualizarFotoPerfil,
    {
      provide: 'IUsuariosService',
      useClass: UsuariosService,
    },
  ],
  exports: ['IUsuarioRepository', 'IUsuariosService'],
  controllers: [UsuariosController],
})
export class UsuariosModule {}
