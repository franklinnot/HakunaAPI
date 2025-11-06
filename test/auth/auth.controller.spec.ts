/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/modules/auth/presentation/auth.controller';
import type { IAuthService } from 'src/modules/auth/application/auth.service.interface';
import { RegisterUsuarioDto, LoginDto } from 'src/modules/auth/presentation/auth.dtos';
import type { IRequestWithUser } from 'src/modules/auth/presentation/auth.types';
import type { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import { Estado } from 'src/shared/domain/enums';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<IAuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      crearUsuario: jest.fn(),
      iniciarSesion: jest.fn(),
      getUsuarioByJWT: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: 'IAuthService',
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get('IAuthService');
  });

  // ----------------------------------------------------------------
  // TEST 1: Crear usuario exitosamente
  // ----------------------------------------------------------------
  it('debe crear un usuario correctamente', async () => {
    const dto: RegisterUsuarioDto = {
      nombre: 'Frank',
      username: 'frank',
      password: '123456',
      foto: 'base64-foto',
    };

    const mockResponse = {
      success: true,
      data: {
        usuario: {
          id_usuario: 'u123',
          username: 'frank',
          nombre: 'Frank',
          link_foto: 'https://example.com/foto.png',
          createdAt: new Date(),
        },
        token: 'jwt-token-mock',
      },
    };

    authService.crearUsuario.mockResolvedValue(mockResponse);

    const result = await controller.crearUsuario(dto);

    expect(result).toEqual(mockResponse);
    expect(authService.crearUsuario).toHaveBeenCalledWith(
      'Frank',
      'frank',
      '123456',
      'base64-foto',
    );
  });

  // ----------------------------------------------------------------
  // TEST 2: Crear usuario sin foto
  // ----------------------------------------------------------------
  it('debe crear un usuario sin foto correctamente', async () => {
    const dto: RegisterUsuarioDto = {
      nombre: 'Ana',
      username: 'ana',
      password: '123456',
    };

    const mockResponse = {
      success: true,
      data: {
        usuario: {
          id_usuario: 'u456',
          username: 'ana',
          nombre: 'Ana',
          link_foto: '',
          createdAt: new Date(),
        },
        token: 'jwt-token-ana',
      },
    };

    authService.crearUsuario.mockResolvedValue(mockResponse);

    const result = await controller.crearUsuario(dto);

    expect(result).toEqual(mockResponse);
    expect(authService.crearUsuario).toHaveBeenCalledWith(
      'Ana',
      'ana',
      '123456',
      undefined,
    );
  });

  // ----------------------------------------------------------------
  // TEST 3: Iniciar sesión exitosamente
  // ----------------------------------------------------------------
  it('debe iniciar sesión correctamente', async () => {
    const dto: LoginDto = {
      username: 'frank',
      password: '123456',
    };

    const mockResponse = {
      success: true,
      data: {
        usuario: {
          id_usuario: 'u123',
          username: 'frank',
          nombre: 'Frank',
          link_foto: 'https://example.com/foto.png',
          createdAt: new Date(),
        },
        token: 'jwt-token-mock',
      },
    };

    authService.iniciarSesion.mockResolvedValue(mockResponse);

    const result = await controller.iniciarSesion(dto);

    expect(result).toEqual(mockResponse);
    expect(authService.iniciarSesion).toHaveBeenCalledWith('frank', '123456');
  });

  // ----------------------------------------------------------------
  // TEST 4: Iniciar sesión con credenciales incorrectas
  // ----------------------------------------------------------------
  it('debe retornar error cuando las credenciales son incorrectas', async () => {
    const dto: LoginDto = {
      username: 'frank',
      password: 'wrongpassword',
    };

    const mockResponse = {
      success: false,
      data: null,
      error: 'Credenciales incorrectas',
    };

    authService.iniciarSesion.mockResolvedValue(mockResponse);

    const result = await controller.iniciarSesion(dto);

    expect(result).toEqual(mockResponse);
    expect(result.success).toBe(false);
    expect(authService.iniciarSesion).toHaveBeenCalledWith(
      'frank',
      'wrongpassword',
    );
  });

  // ----------------------------------------------------------------
  // TEST 5: Obtener usuario por JWT exitosamente
  // ----------------------------------------------------------------
  it('debe obtener usuario por JWT correctamente', async () => {
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
      data: {
        usuario: {
          id_usuario: 'u123',
          username: 'frank',
          nombre: 'Frank',
          link_foto: 'https://example.com/foto.png',
          createdAt: new Date(),
        },
        token: 'jwt-token-renewed',
      },
    };

    authService.getUsuarioByJWT.mockResolvedValue(mockResponse);

    const result = await controller.getUsuarioByJWT(mockRequest);

    expect(result).toEqual(mockResponse);
    expect(authService.getUsuarioByJWT).toHaveBeenCalledWith(mockUsuario);
  });

  // ----------------------------------------------------------------
  // TEST 6: Fallo al crear usuario
  // ----------------------------------------------------------------
  it('debe propagar error si crearUsuario falla', async () => {
    const dto: RegisterUsuarioDto = {
      nombre: 'Carlos',
      username: 'carlos',
      password: '123456',
    };

    authService.crearUsuario.mockRejectedValue(
      new Error('Error al crear usuario'),
    );

    await expect(controller.crearUsuario(dto)).rejects.toThrow(
      'Error al crear usuario',
    );
  });

  // ----------------------------------------------------------------
  // TEST 7: Fallo al iniciar sesión
  // ----------------------------------------------------------------
  it('debe propagar error si iniciarSesion falla', async () => {
    const dto: LoginDto = {
      username: 'frank',
      password: '123456',
    };

    authService.iniciarSesion.mockRejectedValue(new Error('Error de BD'));

    await expect(controller.iniciarSesion(dto)).rejects.toThrow('Error de BD');
  });

  // ----------------------------------------------------------------
  // TEST 8: Fallo al obtener usuario por JWT
  // ----------------------------------------------------------------
  it('debe propagar error si getUsuarioByJWT falla', async () => {
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

    authService.getUsuarioByJWT.mockRejectedValue(
      new Error('Error al obtener usuario'),
    );

    await expect(controller.getUsuarioByJWT(mockRequest)).rejects.toThrow(
      'Error al obtener usuario',
    );
  });
});