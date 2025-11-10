import { Test, TestingModule } from '@nestjs/testing';
import { DeleteArchivo } from '../../../src/modules/archivos/application/use-cases/delete-archivo';
import { StorageService } from '../../../src/modules/archivos/application/storage.service';
import { Estado, TipoArchivo } from '../../../src/shared/domain/enums';

describe('DeleteArchivo', () => {
  let service: DeleteArchivo;
  let archivoRepository: any;
  let storageService: StorageService;

  const mockArchivoRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockStorageService = {
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteArchivo,
        {
          provide: 'IArchivoRepository',
          useValue: mockArchivoRepository,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<DeleteArchivo>(DeleteArchivo);
    archivoRepository = mockArchivoRepository;
    storageService = module.get<StorageService>(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - Happy Path', () => {
    it('debe eliminar un archivo correctamente', async () => {
      const id_archivo = 'archivo123';
      const mockArchivo = {
        _id: id_archivo,
        nombre: 'test-image',
        tipo_archivo: TipoArchivo.IMAGEN,
        extension: '.webp',
        filekey: 'Imagen/uuid123.webp',
        link: 'https://storage.com/image.webp',
        size: '2MB',
        estado: Estado.HABILITADO,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedArchivo = {
        ...mockArchivo,
        filekey: null,
        link: null,
      };

      mockArchivoRepository.findById.mockResolvedValue(mockArchivo);
      mockStorageService.deleteFile.mockResolvedValue(undefined);
      mockArchivoRepository.update.mockResolvedValue(mockUpdatedArchivo);

      const result = await service.execute(id_archivo);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        mockArchivo.filekey,
      );
      expect(mockArchivoRepository.update).toHaveBeenCalledWith(id_archivo, {
        filekey: null,
        link: null,
      });
    });
  });

  describe('execute - Sad Paths', () => {
    it('debe fallar si el archivo no existe', async () => {
      const id_archivo = 'archivo-inexistente';

      mockArchivoRepository.findById.mockResolvedValue(null);

      const result = await service.execute(id_archivo);

      expect(result.success).toBe(false);
      expect(result.error).toBe('La imagen no existe.');
      expect(mockStorageService.deleteFile).not.toHaveBeenCalled();
    });

    it('debe fallar si el archivo no tiene filekey', async () => {
      const id_archivo = 'archivo123';
      const mockArchivo = {
        _id: id_archivo,
        filekey: null,
      };

      mockArchivoRepository.findById.mockResolvedValue(mockArchivo);

      const result = await service.execute(id_archivo);

      expect(result.success).toBe(false);
      expect(result.error).toBe('La imagen no existe.');
    });
  });
});
