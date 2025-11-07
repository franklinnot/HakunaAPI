import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ViewerRepository } from '../../../src/modules/mensajes/infraestructure/repositories/viewer.repository';
import { Viewer } from '../../../src/modules/mensajes/infraestructure/schemas/viewer.schema';
import { Estado } from '../../../src/shared/domain/enums';

describe('ViewerRepository', () => {
  let repository: ViewerRepository;
  let model: Model<Viewer>;

  const mockViewer = {
    _id: '507f1f77bcf86cd799439011',
    id_integrante: 'integrante123',
    id_mensaje: 'mensaje123',
    visto: false,
    estado: Estado.HABILITADO,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockViewerModel = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewerRepository,
        {
          provide: getModelToken(Viewer.name),
          useValue: mockViewerModel,
        },
      ],
    }).compile();

    repository = module.get<ViewerRepository>(ViewerRepository);
    model = module.get<Model<Viewer>>(getModelToken(Viewer.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toDomain', () => {
    it('debe convertir un documento de Viewer a dominio correctamente', () => {
      const result = repository['toDomain'](mockViewer as any);

      expect(result).toEqual({
        _id: mockViewer._id,
        createdAt: mockViewer.createdAt,
        updatedAt: mockViewer.updatedAt,
        estado: mockViewer.estado,
        id_integrante: mockViewer.id_integrante,
        id_mensaje: mockViewer.id_mensaje,
        visto: mockViewer.visto,
      });
    });

    it('debe usar valores por defecto cuando faltan propiedades', () => {
      const incompleteViewer = {
        _id: '',
      };

      const result = repository['toDomain'](incompleteViewer as any);

      expect(result._id).toBe('');
      expect(result.estado).toBe(Estado.HABILITADO);
      expect(result.visto).toBe(false);
      expect(result.id_integrante).toBe('');
      expect(result.id_mensaje).toBe('');
    });
  });

  describe('registrarViewers', () => {
    it('debe registrar múltiples viewers correctamente', async () => {
      const id_mensaje = 'mensaje123';
      const integrantes = [
        { id_integrante: 'int1', visto: true },
        { id_integrante: 'int2', visto: false },
        { id_integrante: 'int3', visto: false },
      ];

      const mockCreatedViewers = integrantes.map((i, index) => ({
        ...mockViewer,
        _id: `viewer${index}`,
        id_integrante: i.id_integrante,
        id_mensaje: id_mensaje,
        visto: i.visto,
      }));

      jest.spyOn(repository, 'create').mockImplementation((data: any) => {
        const index = integrantes.findIndex(
          (i) => i.id_integrante === data.id_integrante,
        );
        return Promise.resolve(mockCreatedViewers[index] as any);
      });

      const result = await repository.registrarViewers(id_mensaje, integrantes);

      expect(result).toHaveLength(3);
      expect(repository.create).toHaveBeenCalledTimes(3);
      expect(result[0].visto).toBe(true);
      expect(result[1].visto).toBe(false);
      expect(result[2].visto).toBe(false);
    });

    it('debe manejar un array vacío de integrantes', async () => {
      const id_mensaje = 'mensaje123';
      const integrantes: { id_integrante: string; visto: boolean }[] = [];

      const result = await repository.registrarViewers(id_mensaje, integrantes);

      expect(result).toHaveLength(0);
    });

    it('debe manejar errores al crear viewers', async () => {
      const id_mensaje = 'mensaje123';
      const integrantes = [{ id_integrante: 'int1', visto: false }];

      jest
        .spyOn(repository, 'create')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        repository.registrarViewers(id_mensaje, integrantes),
      ).rejects.toThrow('Database error');
    });
  });
});
