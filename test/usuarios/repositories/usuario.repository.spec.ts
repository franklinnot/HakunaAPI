/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Estado } from 'src/shared/domain/enums';
import { UsuarioRepository } from 'src/modules/usuarios/infraestructure/repositories/usuario.repository';
import { Usuario } from 'src/modules/usuarios/infraestructure/schemas/usuario.schema';

describe('UsuarioRepository', () => {
  let repository: UsuarioRepository;
  let model: jest.Mocked<Model<Usuario>>;

  beforeEach(async () => {
    const mockModel = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioRepository,
        {
          provide: getModelToken(Usuario.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<UsuarioRepository>(UsuarioRepository);
    model = module.get(getModelToken(Usuario.name));
  });

  // ----------------------------------------------------------------
  // TEST 1: Encontrar usuario por username con password exitosamente
  // ----------------------------------------------------------------
  it('debe encontrar un usuario por username con password', async () => {
    const mockUsuarioDoc = {
      _id: 'user123',
      nombre: 'Frank',
      username: 'frank',
      password: 'hashedPassword123',
      id_foto: 'foto123',
      estado: Estado.HABILITADO,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    const mockChain = {
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockUsuarioDoc),
    };

    model.findOne.mockReturnValue(mockChain as any);

    const result = await repository.findOneByUsernameWithPass('frank');

    expect(result).not.toBeNull();
    expect(result?._id).toBe('user123');
    expect(result?.username).toBe('frank');
    expect(result?.password).toBe('hashedPassword123');
    expect(result?.nombre).toBe('Frank');
    expect(result?.id_foto).toBe('foto123');
    expect(result?.estado).toBe(Estado.HABILITADO);
    expect(model.findOne).toHaveBeenCalledWith({ username: 'frank' });
    expect(mockChain.select).toHaveBeenCalledWith('+password');
    expect(mockChain.lean).toHaveBeenCalled();
    expect(mockChain.exec).toHaveBeenCalled();
  });

  // ----------------------------------------------------------------
  // TEST 2: No encontrar usuario (username no existe)
  // ----------------------------------------------------------------
  it('debe retornar null si el usuario no existe', async () => {
    const mockChain = {
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null),
    };

    model.findOne.mockReturnValue(mockChain as any);

    const result = await repository.findOneByUsernameWithPass('noexiste');

    expect(result).toBeNull();
    expect(model.findOne).toHaveBeenCalledWith({ username: 'noexiste' });
    expect(mockChain.select).toHaveBeenCalledWith('+password');
    expect(mockChain.lean).toHaveBeenCalled();
    expect(mockChain.exec).toHaveBeenCalled();
  });

  // ----------------------------------------------------------------
  // TEST 3: toDomain maneja correctamente valores por defecto
  // ----------------------------------------------------------------
  it('debe aplicar valores por defecto en toDomain cuando los campos son undefined', async () => {
    const mockUsuarioDoc = {
      _id: 'user456',
      nombre: 'Ana',
      username: 'ana',
      password: 'hash456',
      // Simulamos que algunos campos vienen undefined/null
      id_foto: undefined,
      estado: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    };

    const mockChain = {
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockUsuarioDoc),
    };

    model.findOne.mockReturnValue(mockChain as any);

    const result = await repository.findOneByUsernameWithPass('ana');

    expect(result).not.toBeNull();
    expect(result?.id_foto).toBeNull(); // Debe ser null por defecto
    expect(result?.estado).toBe(Estado.HABILITADO); // Debe ser HABILITADO por defecto
    expect(result?.createdAt).toBeInstanceOf(Date);
    expect(result?.updatedAt).toBeInstanceOf(Date);
  });

  // ----------------------------------------------------------------
  // TEST 4: Fallo inesperado (error de base de datos)
  // ----------------------------------------------------------------
  it('debe propagar errores inesperados de la base de datos', async () => {
    const mockChain = {
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockRejectedValue(new Error('DB connection error')),
    };

    model.findOne.mockReturnValue(mockChain as any);

    await expect(
      repository.findOneByUsernameWithPass('frank'),
    ).rejects.toThrow('DB connection error');
  });
});