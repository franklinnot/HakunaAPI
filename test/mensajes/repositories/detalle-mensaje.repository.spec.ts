import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DetalleMensajeRepository } from '../../../src/modules/mensajes/infraestructure/repositories/detalle-mensaje.repository';
import { DetalleMensaje } from '../../../src/modules/mensajes/infraestructure/schemas/detalle-mensaje.schema';
import { Estado } from '../../../src/shared/domain/enums';

describe('DetalleMensajeRepository', () => {
  let repository: DetalleMensajeRepository;
  let model: Model<DetalleMensaje>;

  const mockDetalleMensaje = {
    _id: '507f1f77bcf86cd799439011',
    id_archivo: 'archivo123',
    id_mensaje: 'mensaje123',
    estado: Estado.HABILITADO,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDetalleMensajeModel = {
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
        DetalleMensajeRepository,
        {
          provide: getModelToken(DetalleMensaje.name),
          useValue: mockDetalleMensajeModel,
        },
      ],
    }).compile();

    repository = module.get<DetalleMensajeRepository>(DetalleMensajeRepository);
    model = module.get<Model<DetalleMensaje>>(
      getModelToken(DetalleMensaje.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toDomain', () => {
    it('debe convertir un documento de DetalleMensaje a dominio correctamente', () => {
      const result = repository['toDomain'](mockDetalleMensaje as any);

      expect(result).toEqual({
        _id: mockDetalleMensaje._id,
        createdAt: mockDetalleMensaje.createdAt,
        updatedAt: mockDetalleMensaje.updatedAt,
        estado: mockDetalleMensaje.estado,
        id_archivo: mockDetalleMensaje.id_archivo,
        id_mensaje: mockDetalleMensaje.id_mensaje,
      });
    });

    it('debe usar valores por defecto cuando faltan propiedades', () => {
      const incompleteDetalle = {
        _id: '',
      };

      const result = repository['toDomain'](incompleteDetalle as any);

      expect(result._id).toBe('');
      expect(result.estado).toBe(Estado.HABILITADO);
      expect(result.id_archivo).toBe('');
      expect(result.id_mensaje).toBe('');
    });
  });

  describe('findByMensaje', () => {
    it('debe encontrar todos los detalles de un mensaje', async () => {
      const id_mensaje = 'mensaje123';
      const mockDetalles = [
        { ...mockDetalleMensaje, _id: 'detalle1' },
        { ...mockDetalleMensaje, _id: 'detalle2' },
      ];

      jest.spyOn(repository, 'findAll').mockResolvedValue(mockDetalles as any);

      const result = await repository.findByMensaje(id_mensaje);

      expect(result).toEqual(mockDetalles);
      expect(repository.findAll).toHaveBeenCalledWith({
        id_mensaje: id_mensaje,
      });
    });

    it('debe retornar array vacío si no hay detalles', async () => {
      const id_mensaje = 'mensaje123';

      jest.spyOn(repository, 'findAll').mockResolvedValue([]);

      const result = await repository.findByMensaje(id_mensaje);

      expect(result).toEqual([]);
    });

    it('debe manejar errores al buscar detalles', async () => {
      const id_mensaje = 'mensaje123';

      jest
        .spyOn(repository, 'findAll')
        .mockRejectedValue(new Error('Database error'));

      await expect(repository.findByMensaje(id_mensaje)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('registrarDetalles', () => {
    it('debe registrar múltiples detalles correctamente', async () => {
      const detalles = [
        { id_mensaje: 'mensaje1', id_integrante: 'archivo1' },
        { id_mensaje: 'mensaje1', id_integrante: 'archivo2' },
      ];

      const mockCreatedDetalles = detalles.map((d, index) => ({
        ...mockDetalleMensaje,
        _id: `detalle${index}`,
        id_mensaje: d.id_mensaje,
        id_archivo: d.id_integrante,
      }));

      jest.spyOn(repository, 'create').mockImplementation((data: any) => {
        const index = detalles.findIndex(
          (d) => d.id_integrante === data.id_archivo,
        );
        return Promise.resolve(mockCreatedDetalles[index] as any);
      });

      const result = await repository.registrarDetalles(detalles);

      expect(result).toHaveLength(2);
      expect(repository.create).toHaveBeenCalledTimes(2);
    });

    it('debe manejar un array vacío de detalles', async () => {
      const detalles: { id_mensaje: string; id_integrante: string }[] = [];

      const result = await repository.registrarDetalles(detalles);

      expect(result).toHaveLength(0);
    });

    it('debe manejar errores al crear detalles', async () => {
      const detalles = [{ id_mensaje: 'mensaje1', id_integrante: 'archivo1' }];

      jest
        .spyOn(repository, 'create')
        .mockRejectedValue(new Error('Database error'));

      await expect(repository.registrarDetalles(detalles)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
