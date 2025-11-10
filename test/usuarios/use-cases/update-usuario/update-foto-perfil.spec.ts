/* eslint-disable @typescript-eslint/unbound-method */
import { UpdateFotoPerfil } from 'src/modules/usuarios/application/use-cases/update-usuario/update-foto-perfil';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import type { IArchivosService } from 'src/modules/archivos/application/archivos.service.interface';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';
import type { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import { Estado, TipoArchivo } from 'src/shared/domain/enums';

describe('UpdateFotoPerfil', () => {
  let updateFotoPerfil: UpdateFotoPerfil;
  let usuarioRepository: jest.Mocked<IUsuarioRepository>;
  let archivosService: jest.Mocked<IArchivosService>;
  let archivoRepository: jest.Mocked<IArchivoRepository>;

  beforeEach(() => {
    usuarioRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IUsuarioRepository>;

    archivosService = {
      saveImagen: jest.fn(),
      updateImagen: jest.fn(),
      deleteArchivo: jest.fn(),
    } as unknown as jest.Mocked<IArchivosService>;

    archivoRepository = {
      findLinkById: jest.fn(),
    } as unknown as jest.Mocked<IArchivoRepository>;

    updateFotoPerfil = new UpdateFotoPerfil(
      usuarioRepository,
      archivosService,
      archivoRepository,
    );
  });

  // ----------------------------------------------------------------
  // TEST 1: Usuario sin foto, llega foto nueva (debe guardar)
  // ----------------------------------------------------------------
  it('debe guardar foto cuando el usuario no tiene foto previa', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u123',
      username: 'frank',
      nombre: 'Frank',
      password: 'hashedPassword',
      id_foto: null,
      estado: Estado.HABILITADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    usuarioRepository.findById.mockResolvedValue(mockUsuario);
    archivoRepository.findLinkById.mockResolvedValue(null);
    archivosService.saveImagen.mockResolvedValue({
      success: true,
      data: {
        id_archivo: 'archivo123',
        nombre: 'nueva-foto.png',
        link: 'https://example.com/nueva-foto.png',
        tipo_archivo: TipoArchivo.IMAGEN,
        extension: 'png',
        size: '1024',
        estado: Estado.HABILITADO,
      },
    });

    const result = await updateFotoPerfil.execute('u123', 'base64-foto-nueva');

    expect(result).toBe('https://example.com/nueva-foto.png');
    expect(usuarioRepository.findById).toHaveBeenCalledWith('u123');
    expect(archivoRepository.findLinkById).toHaveBeenCalledWith('');
    expect(archivosService.saveImagen).toHaveBeenCalledWith(
      'base64-foto-nueva',
    );
    expect(usuarioRepository.update).toHaveBeenCalledWith('u123', {
      id_foto: 'archivo123',
    });
  });

  // ----------------------------------------------------------------
  // TEST 2: Usuario sin foto, NO llega foto (no debe hacer nada)
  // ----------------------------------------------------------------
  it('debe retornar null cuando el usuario no tiene foto y no llega foto nueva', async () => {
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

    usuarioRepository.findById.mockResolvedValue(mockUsuario);
    archivoRepository.findLinkById.mockResolvedValue(null);

    const result = await updateFotoPerfil.execute('u456', null);

    expect(result).toBeNull();
    expect(usuarioRepository.findById).toHaveBeenCalledWith('u456');
    expect(archivoRepository.findLinkById).toHaveBeenCalledWith('');
    expect(archivosService.saveImagen).not.toHaveBeenCalled();
    expect(archivosService.updateImagen).not.toHaveBeenCalled();
    expect(archivosService.deleteArchivo).not.toHaveBeenCalled();
    expect(usuarioRepository.update).not.toHaveBeenCalled();
  });

  // ----------------------------------------------------------------
  // TEST 3: Usuario con foto, NO llega foto (debe eliminar)
  // ----------------------------------------------------------------
  it('debe eliminar foto cuando el usuario tiene foto y llega null', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u789',
      username: 'carlos',
      nombre: 'Carlos',
      password: 'hashedPassword',
      id_foto: 'foto-antigua-123',
      estado: Estado.HABILITADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    usuarioRepository.findById.mockResolvedValue(mockUsuario);
    archivoRepository.findLinkById.mockResolvedValue(
      'https://example.com/foto-antigua.png',
    );
    archivosService.deleteArchivo.mockResolvedValue({
      success: true,
      data: {
        id_archivo: 'foto-antigua-123',
        nombre: 'foto-antigua.png',
        link: 'https://example.com/foto-antigua.png',
        tipo_archivo: TipoArchivo.IMAGEN,
        extension: 'png',
        size: '1024',
        estado: Estado.DESHABILITADO,
      },
    });

    const result = await updateFotoPerfil.execute('u789', null);

    expect(result).toBeNull();
    expect(usuarioRepository.findById).toHaveBeenCalledWith('u789');
    expect(archivoRepository.findLinkById).toHaveBeenCalledWith(
      'foto-antigua-123',
    );
    expect(archivosService.deleteArchivo).toHaveBeenCalledWith(
      'foto-antigua-123',
    );
    expect(usuarioRepository.update).toHaveBeenCalledWith('u789', {
      id_foto: null,
    });
    expect(archivosService.saveImagen).not.toHaveBeenCalled();
  });
  
  // ----------------------------------------------------------------
  // TEST 4: Usuario con foto, llega foto nueva (debe actualizar)
  // ----------------------------------------------------------------
  it('debe actualizar foto cuando el usuario tiene foto y llega foto nueva', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u999',
      username: 'maria',
      nombre: 'Maria',
      password: 'hashedPassword',
      id_foto: 'foto-antigua-456',
      estado: Estado.HABILITADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    usuarioRepository.findById.mockResolvedValue(mockUsuario);
    archivoRepository.findLinkById.mockResolvedValue(
      'https://example.com/foto-antigua.png',
    );
    archivosService.updateImagen.mockResolvedValue({
      success: true,
      data: {
        id_archivo: 'foto-nueva-789',
        nombre: 'foto-nueva.png',
        link: 'https://example.com/foto-nueva.png',
        tipo_archivo: TipoArchivo.IMAGEN,
        extension: 'png',
        size: '2048',
        estado: Estado.HABILITADO,
      },
    });

    const result = await updateFotoPerfil.execute('u999', 'base64-foto-nueva');

    expect(result).toBe('https://example.com/foto-nueva.png');
    expect(usuarioRepository.findById).toHaveBeenCalledWith('u999');
    expect(archivoRepository.findLinkById).toHaveBeenCalledWith(
      'foto-antigua-456',
    );
    expect(archivosService.updateImagen).toHaveBeenCalledWith(
      'foto-antigua-456',
      'base64-foto-nueva',
    );
    expect(usuarioRepository.update).toHaveBeenCalledWith('u999', {
      id_foto: 'foto-nueva-789',
    });
    expect(archivosService.saveImagen).not.toHaveBeenCalled();
    expect(archivosService.deleteArchivo).not.toHaveBeenCalled();
  });

  // ----------------------------------------------------------------
  // TEST 5: Error al guardar nueva imagen
  // ----------------------------------------------------------------
  it('debe propagar error si saveImagen falla', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u111',
      username: 'pedro',
      nombre: 'Pedro',
      password: 'hashedPassword',
      id_foto: null,
      estado: Estado.HABILITADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    usuarioRepository.findById.mockResolvedValue(mockUsuario);
    archivoRepository.findLinkById.mockResolvedValue(null);
    archivosService.saveImagen.mockRejectedValue(
      new Error('Error al guardar imagen'),
    );

    await expect(
      updateFotoPerfil.execute('u111', 'base64-foto'),
    ).rejects.toThrow('Error al guardar imagen');
  });

  // ----------------------------------------------------------------
  // TEST 6: Error al actualizar imagen
  // ----------------------------------------------------------------
  it('debe propagar error si updateImagen falla', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u222',
      username: 'lucia',
      nombre: 'Lucia',
      password: 'hashedPassword',
      id_foto: 'foto-antigua',
      estado: Estado.HABILITADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    usuarioRepository.findById.mockResolvedValue(mockUsuario);
    archivoRepository.findLinkById.mockResolvedValue(
      'https://example.com/foto-antigua.png',
    );
    archivosService.updateImagen.mockRejectedValue(
      new Error('Error al actualizar imagen'),
    );

    await expect(
      updateFotoPerfil.execute('u222', 'base64-foto-nueva'),
    ).rejects.toThrow('Error al actualizar imagen');
  });

  // ----------------------------------------------------------------
  // TEST 7: Error al eliminar imagen
  // ----------------------------------------------------------------
  it('debe propagar error si deleteArchivo falla', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u333',
      username: 'jorge',
      nombre: 'Jorge',
      password: 'hashedPassword',
      id_foto: 'foto-antigua',
      estado: Estado.HABILITADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    usuarioRepository.findById.mockResolvedValue(mockUsuario);
    archivoRepository.findLinkById.mockResolvedValue(
      'https://example.com/foto-antigua.png',
    );
    archivosService.deleteArchivo.mockRejectedValue(
      new Error('Error al eliminar archivo'),
    );

    await expect(updateFotoPerfil.execute('u333', null)).rejects.toThrow(
      'Error al eliminar archivo',
    );
  });
});