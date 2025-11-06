/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from 'src/modules/usuarios/presentation/usuarios.controller';
import type { IUsuariosService } from 'src/modules/usuarios/application/usuarios.service.interface';
import { UpdateUsuarioDto } from 'src/modules/usuarios/presentation/usuarios.dtos';
import type { IRequestWithUser } from 'src/modules/auth/presentation/auth.types';
import type { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import { Estado } from 'src/shared/domain/enums';

describe('UsuariosController', () => {
  let controller: UsuariosController;
  let usuariosService: jest.Mocked<IUsuariosService>;

  beforeEach(async () => {
    const mockUsuariosService = {
      existeUsuarioPorUsername: jest.fn(),
      updateUsuario: jest.fn(),
      disableUsuario: jest.fn(),
      getUsuariosPorNombreOUsername: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        {
          provide: 'IUsuariosService',
          useValue: mockUsuariosService,
        },
      ],
    }).compile();

    controller = module.get<UsuariosController>(UsuariosController);
    usuariosService = module.get('IUsuariosService');
  });

  // ----------------------------------------------------------------
  // TEST 1: Verificar si username existe (existe = true)
  // ----------------------------------------------------------------
  it('debe verificar si un username existe', async () => {
    const mockResponse = {
      success: true,
      data: true,
    };

    usuariosService.existeUsuarioPorUsername.mockResolvedValue(mockResponse);

    const result = await controller.existeUsuarioPorUsername('frank');

    expect(result).toEqual(mockResponse);
    expect(usuariosService.existeUsuarioPorUsername).toHaveBeenCalledWith(
      'frank',
    );
  });

  // ----------------------------------------------------------------
  // TEST 2: Verificar si username existe (existe = false)
  // ----------------------------------------------------------------
  it('debe retornar false cuando el username no existe', async () => {
    const mockResponse = {
      success: true,
      data: false,
    };

    usuariosService.existeUsuarioPorUsername.mockResolvedValue(mockResponse);

    const result = await controller.existeUsuarioPorUsername('noexiste');

    expect(result).toEqual(mockResponse);
    expect(result.data).toBe(false);
    expect(usuariosService.existeUsuarioPorUsername).toHaveBeenCalledWith(
      'noexiste',
    );
  });

  // ----------------------------------------------------------------
  // TEST 3: Actualizar usuario exitosamente
  // ----------------------------------------------------------------
  it('debe actualizar un usuario correctamente', async () => {
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

    const mockRequest = {
      user: {
        success: true,
        data: mockUsuario,
      },
    } as IRequestWithUser;

    const dto: UpdateUsuarioDto = {
      nombre: 'Frank Updated',
      username: 'frank_new',
      foto: 'base64-foto',
    };

    const mockResponse = {
      success: true,
      data: {
        id_usuario: 'u123',
        username: 'frank_new',
        nombre: 'Frank Updated',
        link_foto: 'https://example.com/foto-nueva.png',
        createdAt: new Date(),
      },
    };

    usuariosService.updateUsuario.mockResolvedValue(mockResponse);

    const result = await controller.updateUsuario(mockRequest, dto);

    expect(result).toEqual(mockResponse);
    expect(usuariosService.updateUsuario).toHaveBeenCalledWith(
      mockUsuario,
      'Frank Updated',
      'frank_new',
      'base64-foto',
    );
  });

  // ----------------------------------------------------------------
  // TEST 4: Actualizar usuario sin foto
  // ----------------------------------------------------------------
  it('debe actualizar un usuario sin cambiar la foto', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u456',
      username: 'ana',
      nombre: 'Ana',
      password: 'hashedPassword',
      id_foto: 'foto456',
      estado: Estado.HABILITADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockRequest = {
      user: {
        success: true,
        data: mockUsuario,
      },
    } as IRequestWithUser;

    const dto: UpdateUsuarioDto = {
      nombre: 'Ana Updated',
      username: 'ana',
    };

    const mockResponse = {
      success: true,
      data: {
        id_usuario: 'u456',
        username: 'ana',
        nombre: 'Ana Updated',
        link_foto: 'https://example.com/foto-vieja.png',
        createdAt: new Date(),
      },
    };

    usuariosService.updateUsuario.mockResolvedValue(mockResponse);

    const result = await controller.updateUsuario(mockRequest, dto);

    expect(result).toEqual(mockResponse);
    expect(usuariosService.updateUsuario).toHaveBeenCalledWith(
      mockUsuario,
      'Ana Updated',
      'ana',
      undefined,
    );
  });

  // ----------------------------------------------------------------
  // TEST 5: Deshabilitar usuario exitosamente
  // ----------------------------------------------------------------
  it('debe deshabilitar un usuario correctamente', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u789',
      username: 'carlos',
      nombre: 'Carlos',
      password: 'hashedPassword',
      id_foto: null,
      estado: Estado.HABILITADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockRequest = {
      user: {
        success: true,
        data: mockUsuario,
      },
    } as IRequestWithUser;

    const mockResponse = {
      success: true,
      data: true,
    };

    usuariosService.disableUsuario.mockResolvedValue(mockResponse);

    const result = await controller.disableUsuario(mockRequest);

    expect(result).toEqual(mockResponse);
    expect(usuariosService.disableUsuario).toHaveBeenCalledWith('u789');
  });

  // ----------------------------------------------------------------
  // TEST 6: Buscar usuarios por nombre o username exitosamente
  // ----------------------------------------------------------------
  it('debe buscar usuarios por nombre o username', async () => {
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

    const mockRequest = {
      user: {
        success: true,
        data: mockUsuario,
      },
    } as IRequestWithUser;

    const mockResponse = {
      success: true,
      data: [
        {
          id_usuario: 'u456',
          username: 'ana',
          nombre: 'Ana',
          link_foto: 'https://example.com/ana.png',
          createdAt: new Date(),
        },
        {
          id_usuario: 'u789',
          username: 'anita',
          nombre: 'Anita',
          link_foto: 'https://example.com/anita.png',
          createdAt: new Date(),
        },
      ],
    };

    usuariosService.getUsuariosPorNombreOUsername.mockResolvedValue(
      mockResponse,
    );

    const result = await controller.getUsuariosPorNombreOUsername(
      mockRequest,
      'ana',
    );

    expect(result).toEqual(mockResponse);
    expect(result.data?.length).toBe(2);
    expect(usuariosService.getUsuariosPorNombreOUsername).toHaveBeenCalledWith(
      'u123',
      'ana',
    );
  });

  // ----------------------------------------------------------------
  // TEST 7: Buscar usuarios sin resultados
  // ----------------------------------------------------------------
  it('debe retornar array vacío cuando no encuentra usuarios', async () => {
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

    const mockRequest = {
      user: {
        success: true,
        data: mockUsuario,
      },
    } as IRequestWithUser;

    const mockResponse = {
      success: true,
      data: [],
    };

    usuariosService.getUsuariosPorNombreOUsername.mockResolvedValue(
      mockResponse,
    );

    const result = await controller.getUsuariosPorNombreOUsername(
      mockRequest,
      'noexiste',
    );

    expect(result).toEqual(mockResponse);
    expect(result.data?.length).toBe(0);
    expect(usuariosService.getUsuariosPorNombreOUsername).toHaveBeenCalledWith(
      'u123',
      'noexiste',
    );
  });

  // ----------------------------------------------------------------
  // TEST 8: Error al verificar username
  // ----------------------------------------------------------------
  it('debe propagar error si existeUsuarioPorUsername falla', async () => {
    usuariosService.existeUsuarioPorUsername.mockRejectedValue(
      new Error('DB error'),
    );

    await expect(controller.existeUsuarioPorUsername('frank')).rejects.toThrow(
      'DB error',
    );
  });

  // ----------------------------------------------------------------
  // TEST 9: Error al actualizar usuario
  // ----------------------------------------------------------------
  it('debe propagar error si updateUsuario falla', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u999',
      username: 'error',
      nombre: 'Error',
      password: 'hashedPassword',
      id_foto: null,
      estado: Estado.HABILITADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockRequest = {
      user: {
        success: true,
        data: mockUsuario,
      },
    } as IRequestWithUser;

    const dto: UpdateUsuarioDto = {
      nombre: 'Error',
    };

    usuariosService.updateUsuario.mockRejectedValue(
      new Error('Error al actualizar'),
    );

    await expect(controller.updateUsuario(mockRequest, dto)).rejects.toThrow(
      'Error al actualizar',
    );
  });

  // ----------------------------------------------------------------
  // TEST 10: Error al deshabilitar usuario
  // ----------------------------------------------------------------
  it('debe propagar error si disableUsuario falla', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u888',
      username: 'error',
      nombre: 'Error',
      password: 'hashedPassword',
      id_foto: null,
      estado: Estado.HABILITADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockRequest = {
      user: {
        success: true,
        data: mockUsuario,
      },
    } as IRequestWithUser;

    usuariosService.disableUsuario.mockRejectedValue(
      new Error('Error al deshabilitar'),
    );

    await expect(controller.disableUsuario(mockRequest)).rejects.toThrow(
      'Error al deshabilitar',
    );
  });

  // ----------------------------------------------------------------
  // TEST 11: Error al buscar usuarios
  // ----------------------------------------------------------------
  it('debe propagar error si getUsuariosPorNombreOUsername falla', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u777',
      username: 'error',
      nombre: 'Error',
      password: 'hashedPassword',
      id_foto: null,
      estado: Estado.HABILITADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockRequest = {
      user: {
        success: true,
        data: mockUsuario,
      },
    } as IRequestWithUser;

    usuariosService.getUsuariosPorNombreOUsername.mockRejectedValue(
      new Error('Error al buscar'),
    );

    await expect(
      controller.getUsuariosPorNombreOUsername(mockRequest, 'search'),
    ).rejects.toThrow('Error al buscar');
  });
});