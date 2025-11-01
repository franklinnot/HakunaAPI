/* eslint-disable @typescript-eslint/unbound-method */
import { CrearChatGrupal } from 'src/modules/chats/application/use-cases/crear-chat-grupal';
import { Estado, TipoArchivo } from 'src/shared/domain/enums';
import { crearRespuesta } from 'src/shared/application/response';
import type { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import {
  IChatRepository,
  IIntegranteRepository,
} from 'src/modules/chats/infraestructure/chats.repositories.interfaces';
import { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import { UsuariosUtils } from 'src/modules/usuarios/application/usuarios.utils';
import { IArchivosService } from 'src/modules/archivos/application/archivos.service.interface';
import { IArchivoResponse } from 'src/modules/archivos/application/archivos.responses';
import { IChat, IIntegrante } from 'src/modules/chats/domain/chats.entities';

describe('CrearChatGrupal', () => {
  let crearChatGrupal: CrearChatGrupal;

  let chatRepository: jest.Mocked<IChatRepository>;
  let usuarioRepository: jest.Mocked<IUsuarioRepository>;
  let integranteRepository: jest.Mocked<IIntegranteRepository>;
  let usuariosUtils: jest.Mocked<UsuariosUtils>;
  let archivosService: jest.Mocked<IArchivosService>;

  beforeEach(() => {
    chatRepository = {
      findChatPrivadoByIdUsuarios: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<IChatRepository>;

    usuarioRepository = {
      findById: jest.fn(),
      existsById: jest.fn(),
    } as unknown as jest.Mocked<IUsuarioRepository>;

    integranteRepository = {
      registerIntegrantes: jest.fn(),
    } as unknown as jest.Mocked<IIntegranteRepository>;

    usuariosUtils = {
      getUsuarioResponseById: jest.fn(),
    } as unknown as jest.Mocked<UsuariosUtils>;

    archivosService = {
      saveImagen: jest.fn(),
    } as unknown as jest.Mocked<IArchivosService>;

    crearChatGrupal = new CrearChatGrupal(
      chatRepository,
      usuarioRepository,
      integranteRepository,
      usuariosUtils,
      archivosService,
    );
  });

  it('debería crear un chat grupal correctamente', async () => {
    const usuarioCreador: IUsuario = {
      _id: 'u1',
      nombre: 'Break',
      username: 'breakdev',
      estado: Estado.HABILITADO,
    } as IUsuario;

    const otrosUsuarios = [{ id_usuario: 'u2' }, { id_usuario: 'u3' }];

    // Mock repositorios
    usuarioRepository.existsById.mockResolvedValue(true);
    archivosService.saveImagen.mockResolvedValue(
      crearRespuesta<IArchivoResponse>({
        success: true,
        data: {
          id_archivo: 'file1',
          link: 'link-foto',
          nombre: 'foto.png',
          tipo_archivo: TipoArchivo.IMAGEN,
          extension: '.webp',
          size: '0.01MB',
          estado: Estado.HABILITADO,
        },
      }),
    );
    chatRepository.create.mockResolvedValue({
      _id: 'c1',
      nombre: 'Equipo Pollada',
      descripcion: 'Chat del equipo',
      is_group: true,
      cantidad_integrantes: 3,
    } as IChat);

    integranteRepository.registerIntegrantes.mockResolvedValue([
      { id_usuario: 'u1', createdAt: new Date() },
      { id_usuario: 'u2', createdAt: new Date() },
      { id_usuario: 'u3', createdAt: new Date() },
    ] as IIntegrante[]);

    usuariosUtils.getUsuarioResponseById.mockImplementation(
      (id_usuario: string) =>
        Promise.resolve({
          id_usuario,
          nombre: `Usuario ${id_usuario}`,
          username: `user_${id_usuario}`,
          link_foto: 'link',
          createdAt: new Date(),
        }),
    );

    // Ejecutar caso de uso
    const result = await crearChatGrupal.execute(
      usuarioCreador,
      otrosUsuarios,
      'Equipo Pollada',
      'Chat del equipo',
      'foto-base64',
    );

    // Verificaciones
    expect(result.success).toBe(true);
    expect(chatRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Equipo Pollada',
        is_group: true,
        cantidad_integrantes: 3,
      }),
    );
    expect(integranteRepository.registerIntegrantes).toHaveBeenCalled();
    expect(usuariosUtils.getUsuarioResponseById).toHaveBeenCalledTimes(3);
  });

  it('debería devolver error si un usuario no existe', async () => {
    usuarioRepository.existsById.mockResolvedValueOnce(false);

    const usuario = { _id: 'u1' } as IUsuario;
    const usuarios = [{ id_usuario: 'no-existe' }];

    const result = await crearChatGrupal.execute(
      usuario,
      usuarios,
      'Chat Falso',
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Usuario con ID no-existe no encontrado');
    expect(chatRepository.create).not.toHaveBeenCalled();
  });

  it('debería manejar creación sin foto', async () => {
    const usuario = { _id: 'u1' } as IUsuario;
    const usuarios = [{ id_usuario: 'u2' }];

    usuarioRepository.existsById.mockResolvedValue(true);

    chatRepository.create.mockResolvedValue({
      _id: 'c1',
      nombre: 'Sin Foto',
      descripcion: null,
      is_group: true,
      cantidad_integrantes: 2,
    } as IChat);

    integranteRepository.registerIntegrantes.mockResolvedValue([
      { id_usuario: 'u1', createdAt: new Date() },
      { id_usuario: 'u2', createdAt: new Date() },
    ] as IIntegrante[]);

    usuariosUtils.getUsuarioResponseById.mockResolvedValue({
      id_usuario: 'u1',
      nombre: 'Break',
      username: 'breakdev',
      link_foto: 'link',
      createdAt: new Date(),
    });

    const result = await crearChatGrupal.execute(usuario, usuarios, 'Sin Foto');

    expect(result.success).toBe(true);
    expect(archivosService.saveImagen).not.toHaveBeenCalled();
  });
});
