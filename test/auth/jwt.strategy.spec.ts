/* eslint-disable @typescript-eslint/unbound-method */
import { JwtStrategy } from 'src/modules/auth/application/jwt/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import type { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import { Estado } from 'src/shared/domain/enums';
import { JWTPayload } from 'src/modules/auth/presentation/auth.types';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let configService: jest.Mocked<ConfigService>;
  let usuarioRepository: jest.Mocked<IUsuarioRepository>;

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('test-secret-key'),
    } as unknown as jest.Mocked<ConfigService>;

    usuarioRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IUsuarioRepository>;

    jwtStrategy = new JwtStrategy(configService, usuarioRepository);
  });

  // ----------------------------------------------------------------
  // TEST 1: Validar usuario exitosamente (usuario habilitado)
  // ----------------------------------------------------------------
  it('debe validar y retornar usuario cuando está habilitado', async () => {
    const mockPayload: JWTPayload = {
      id_usuario: 'u123',
      username: 'frank',
    };

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

    usuarioRepository.findById.mockResolvedValue(mockUsuario);

    const result = await jwtStrategy.validate(mockPayload);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockUsuario);
    expect(usuarioRepository.findById).toHaveBeenCalledWith('u123');
  });

  // ----------------------------------------------------------------
  // TEST 2: Usuario no encontrado (debe lanzar UnauthorizedException)
  // ----------------------------------------------------------------
  it('debe lanzar UnauthorizedException cuando el usuario no existe', async () => {
    const mockPayload: JWTPayload = {
      id_usuario: 'u999',
      username: 'noexiste',
    };

    usuarioRepository.findById.mockResolvedValue(null);

    await expect(jwtStrategy.validate(mockPayload)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(jwtStrategy.validate(mockPayload)).rejects.toThrow(
      'Usuario no encontrado.',
    );
    expect(usuarioRepository.findById).toHaveBeenCalledWith('u999');
  });

  // ----------------------------------------------------------------
  // TEST 3: Usuario deshabilitado (debe lanzar UnauthorizedException)
  // ----------------------------------------------------------------
  it('debe lanzar UnauthorizedException cuando el usuario está deshabilitado', async () => {
    const mockPayload: JWTPayload = {
      id_usuario: 'u456',
      username: 'deshabilitado',
    };

    const mockUsuario: IUsuario = {
      _id: 'u456',
      username: 'deshabilitado',
      nombre: 'Usuario Deshabilitado',
      password: 'hashedPassword',
      id_foto: null,
      estado: Estado.DESHABILITADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    usuarioRepository.findById.mockResolvedValue(mockUsuario);

    await expect(jwtStrategy.validate(mockPayload)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(jwtStrategy.validate(mockPayload)).rejects.toThrow(
      'Usuario deshabilitado.',
    );
    expect(usuarioRepository.findById).toHaveBeenCalledWith('u456');
  });

  // ----------------------------------------------------------------
  // TEST 4: Verificar que ConfigService se llama en el constructor
  // ----------------------------------------------------------------
  it('debe obtener JWT_SECRET del ConfigService en el constructor', () => {
    expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
  });

  // ----------------------------------------------------------------
  // TEST 5: Error inesperado al buscar usuario
  // ----------------------------------------------------------------
  it('debe propagar errores inesperados del repositorio', async () => {
    const mockPayload: JWTPayload = {
      id_usuario: 'u789',
      username: 'error',
    };

    usuarioRepository.findById.mockRejectedValue(new Error('DB error'));

    await expect(jwtStrategy.validate(mockPayload)).rejects.toThrow('DB error');
    expect(usuarioRepository.findById).toHaveBeenCalledWith('u789');
  });
});