/* eslint-disable @typescript-eslint/unbound-method */
import { CrearUsuario } from 'src/modules/usuarios/application/use-cases/crear-usuario';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import type { IArchivosService } from 'src/modules/archivos/application/archivos.service.interface';
import type { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import { Estado } from 'src/shared/domain/enums';
import { UsuariosMapper } from 'src/modules/usuarios/application/usuarios.mapper';

// Mock del mapper
jest.mock('src/modules/usuarios/application/usuarios.mapper');

describe('CrearUsuario', () => {
  let crearUsuario: CrearUsuario;
  let usuarioRepository: jest.Mocked<IUsuarioRepository>;
  let archivosService: jest.Mocked<IArchivosService>;

  beforeEach(() => {
    usuarioRepository = {
      exists: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<IUsuarioRepository>;

    archivosService = {
      saveImagen: jest.fn(),
    } as unknown as jest.Mocked<IArchivosService>;

    crearUsuario = new CrearUsuario(usuarioRepository, archivosService);

    // Reset mock del mapper
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // TEST 1: Crear usuario con foto exitosamente
  // ----------------------------------------------------------------
  it('debe crear un usuario con foto correctamente', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u123',
      username: 'frank',
      nombre: 'Frank',
      password: 'hashedPassword',
      id_foto: 'foto123',
      estado: Estado.HABILITADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUsuarioResponse = {
      id_usuario: 'u123',
      username: 'frank',
      nombre: 'Frank',
      link_foto: 'https://example.com/foto.png',
      createdAt: new Date(),
    };

    usuarioRepository.exists.mockResolvedValue(false);
    archivosService.saveImagen.mockResolvedValue({
      success: true,
      data: {
        id_archivo: 'foto123',
        nombre: 'foto.png',
        link: 'https://example.com/foto.png',
        tipo_archivo: 'IMAGEN' as any,
        extension: 'png',
        size: '1024',
        estado: Estado.HABILITADO,
      },
    });
    usuarioRepository.create.mockResolvedValue(mockUsuario);
    (UsuariosMapper.toUsuarioResponse as jest.Mock).mockReturnValue(
      mockUsuarioResponse,
    );

    const result = await crearUsuario.execute(
      'Frank',
      'frank',
      '123456',
      'base64-foto',
    );

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockUsuarioResponse);
    expect(usuarioRepository.exists).toHaveBeenCalledWith({
      username: 'frank',
      estado: Estado.HABILITADO,
    });
    expect(archivosService.saveImagen).toHaveBeenCalledWith('base64-foto');
    expect(usuarioRepository.create).toHaveBeenCalledWith({
      id_foto: 'foto123',
      nombre: 'Frank',
      username: 'frank',
      password: '123456',
    });
    expect(UsuariosMapper.toUsuarioResponse).toHaveBeenCalledWith(
      mockUsuario,
      'https://example.com/foto.png',
    );
  });

  // ----------------------------------------------------------------
  // TEST 2: Crear usuario sin foto exitosamente
  // ----------------------------------------------------------------
  it('debe crear un usuario sin foto correctamente', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u456',
      username: 'ana',
      nombre: 'Ana',
      password: 'hashedPassword',
      id_foto: null,
      estado: Estado.HABILITADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUsuarioResponse = {
      id_usuario: 'u456',
      username: 'ana',
      nombre: 'Ana',
      link_foto: null,
      createdAt: new Date(),
    };

    usuarioRepository.exists.mockResolvedValue(false);
    usuarioRepository.create.mockResolvedValue(mockUsuario);
    (UsuariosMapper.toUsuarioResponse as jest.Mock).mockReturnValue(
      mockUsuarioResponse,
    );

    const result = await crearUsuario.execute('Ana', 'ana', '123456');

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockUsuarioResponse);
    expect(usuarioRepository.exists).toHaveBeenCalledWith({
      username: 'ana',
      estado: Estado.HABILITADO,
    });
    expect(archivosService.saveImagen).not.toHaveBeenCalled();
    expect(usuarioRepository.create).toHaveBeenCalledWith({
      id_foto: null,
      nombre: 'Ana',
      username: 'ana',
      password: '123456',
    });
    expect(UsuariosMapper.toUsuarioResponse).toHaveBeenCalledWith(
      mockUsuario,
      null,
    );
  });

  // ----------------------------------------------------------------
  // TEST 3: Usuario ya existe (debe retornar error)
  // ----------------------------------------------------------------
  it('debe retornar error cuando el usuario ya existe', async () => {
    usuarioRepository.exists.mockResolvedValue(true);

    const result = await crearUsuario.execute(
      'Frank',
      'frank',
      '123456',
      'base64-foto',
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('El usuario ya existe.');
    expect(usuarioRepository.exists).toHaveBeenCalledWith({
      username: 'frank',
      estado: Estado.HABILITADO,
    });
    expect(archivosService.saveImagen).not.toHaveBeenCalled();
    expect(usuarioRepository.create).not.toHaveBeenCalled();
  });

  // ----------------------------------------------------------------
  // TEST 4: No se pudo crear el usuario (create retorna null)
  // ----------------------------------------------------------------
  it('debe retornar error cuando no se pudo crear el usuario', async () => {
    usuarioRepository.exists.mockResolvedValue(false);
    usuarioRepository.create.mockResolvedValue(null as any);

    const result = await crearUsuario.execute('Carlos', 'carlos', '123456');

    expect(result.success).toBe(false);
    expect(result.error).toBe('No se pudo crear el usuario.');
    expect(usuarioRepository.exists).toHaveBeenCalledWith({
      username: 'carlos',
      estado: Estado.HABILITADO,
    });
    expect(usuarioRepository.create).toHaveBeenCalledWith({
      id_foto: null,
      nombre: 'Carlos',
      username: 'carlos',
      password: '123456',
    });
  });

  // ----------------------------------------------------------------
  // TEST 5: Username se convierte a lowercase
  // ----------------------------------------------------------------
  it('debe convertir el username a lowercase', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u789',
      username: 'maria',
      nombre: 'Maria',
      password: 'hashedPassword',
      id_foto: null,
      estado: Estado.HABILITADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUsuarioResponse = {
      id_usuario: 'u789',
      username: 'maria',
      nombre: 'Maria',
      link_foto: null,
      createdAt: new Date(),
    };

    usuarioRepository.exists.mockResolvedValue(false);
    usuarioRepository.create.mockResolvedValue(mockUsuario);
    (UsuariosMapper.toUsuarioResponse as jest.Mock).mockReturnValue(
      mockUsuarioResponse,
    );

    const result = await crearUsuario.execute('Maria', 'MARIA', '123456');

    expect(result.success).toBe(true);
    expect(usuarioRepository.exists).toHaveBeenCalledWith({
      username: 'maria',
      estado: Estado.HABILITADO,
    });
    expect(usuarioRepository.create).toHaveBeenCalledWith({
      id_foto: null,
      nombre: 'Maria',
      username: 'maria',
      password: '123456',
    });
  });

  // ----------------------------------------------------------------
  // TEST 6: Error al guardar imagen
  // ----------------------------------------------------------------
  it('debe propagar error si saveImagen falla', async () => {
    usuarioRepository.exists.mockResolvedValue(false);
    archivosService.saveImagen.mockRejectedValue(
      new Error('Error al guardar imagen'),
    );

    await expect(
      crearUsuario.execute('Pedro', 'pedro', '123456', 'base64-foto'),
    ).rejects.toThrow('Error al guardar imagen');
    expect(usuarioRepository.create).not.toHaveBeenCalled();
  });

  // ----------------------------------------------------------------
  // TEST 7: Error al verificar existencia
  // ----------------------------------------------------------------
  it('debe propagar error si exists falla', async () => {
    usuarioRepository.exists.mockRejectedValue(new Error('DB error'));

    await expect(
      crearUsuario.execute('Lucia', 'lucia', '123456'),
    ).rejects.toThrow('DB error');
    expect(usuarioRepository.create).not.toHaveBeenCalled();
  });

  // ----------------------------------------------------------------
  // TEST 8: Error al crear usuario en repositorio
  // ----------------------------------------------------------------
  it('debe propagar error si create falla', async () => {
    usuarioRepository.exists.mockResolvedValue(false);
    usuarioRepository.create.mockRejectedValue(new Error('Error al crear'));

    await expect(
      crearUsuario.execute('Jorge', 'jorge', '123456'),
    ).rejects.toThrow('Error al crear');
  });
});