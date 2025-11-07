import { Test, TestingModule } from '@nestjs/testing';
import { UpdateImagen } from '../../../src/modules/archivos/application/use-cases/update-imagen';
import { SaveImagen } from '../../../src/modules/archivos/application/use-cases/save-imagen';
import { DeleteArchivo } from '../../../src/modules/archivos/application/use-cases/delete-archivo';

describe('UpdateImagen', () => {
  let service: UpdateImagen;
  let archivoRepository: any;
  let saveImagen: SaveImagen;
  let deleteArchivo: DeleteArchivo;

  const mockArchivoRepository = {
    existsById: jest.fn(),
  };

  const mockSaveImagen = {
    execute: jest.fn(),
  };

  const mockDeleteArchivo = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateImagen,
        {
          provide: 'IArchivoRepository',
          useValue: mockArchivoRepository,
        },
        {
          provide: SaveImagen,
          useValue: mockSaveImagen,
        },
        {
          provide: DeleteArchivo,
          useValue: mockDeleteArchivo,
        },
      ],
    }).compile();

    service = module.get<UpdateImagen>(UpdateImagen);
    archivoRepository = mockArchivoRepository;
    saveImagen = module.get<SaveImagen>(SaveImagen);
    deleteArchivo = module.get<DeleteArchivo>(DeleteArchivo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - Happy Path', () => {
    it('debe actualizar una imagen correctamente', async () => {
      const id_archivo = 'archivo123';
      const base64 = 'validBase64Image';
      const nombre = 'nueva-imagen';

      const mockArchivoResponse = {
        id_archivo: 'archivo456',
        nombre: nombre,
        tipo_archivo: 'Imagen',
        extension: '.webp',
        link: 'https://storage.com/new-image.webp',
        size: '2MB',
      };

      mockArchivoRepository.existsById.mockResolvedValue(true);
      mockDeleteArchivo.execute.mockResolvedValue({
        success: true,
        data: {},
      });
      mockSaveImagen.execute.mockResolvedValue({
        success: true,
        data: mockArchivoResponse,
      });

      const result = await service.execute(id_archivo, base64, nombre);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockArchivoResponse);
      expect(mockArchivoRepository.existsById).toHaveBeenCalledWith(id_archivo);
      expect(mockDeleteArchivo.execute).toHaveBeenCalledWith(id_archivo);
      expect(mockSaveImagen.execute).toHaveBeenCalledWith(base64, nombre);
    });

    it('debe actualizar imagen sin nombre', async () => {
      const id_archivo = 'archivo123';
      const base64 = 'validBase64Image';

      const mockArchivoResponse = {
        id_archivo: 'archivo456',
        nombre: null,
        tipo_archivo: 'Imagen',
        extension: '.webp',
        link: 'https://storage.com/new-image.webp',
        size: '1.5MB',
      };

      mockArchivoRepository.existsById.mockResolvedValue(true);
      mockDeleteArchivo.execute.mockResolvedValue({
        success: true,
        data: {},
      });
      mockSaveImagen.execute.mockResolvedValue({
        success: true,
        data: mockArchivoResponse,
      });

      const result = await service.execute(id_archivo, base64);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockArchivoResponse);
      expect(mockSaveImagen.execute).toHaveBeenCalledWith(base64, undefined);
    });
  });

  describe('execute - Sad Paths', () => {
    it('debe fallar si la imagen no existe', async () => {
      const id_archivo = 'archivo-inexistente';
      const base64 = 'validBase64Image';
      const nombre = 'nueva-imagen';

      mockArchivoRepository.existsById.mockResolvedValue(false);

      const result = await service.execute(id_archivo, base64, nombre);

      expect(result.success).toBe(false);
      expect(result.error).toBe('La imagen no existe.');
      expect(mockDeleteArchivo.execute).not.toHaveBeenCalled();
      expect(mockSaveImagen.execute).not.toHaveBeenCalled();
    });

    it('debe fallar si guardar imagen falla', async () => {
      const id_archivo = 'archivo123';
      const base64 = 'invalidBase64Image';

      mockArchivoRepository.existsById.mockResolvedValue(true);
      mockDeleteArchivo.execute.mockResolvedValue({
        success: true,
        data: {},
      });
      mockSaveImagen.execute.mockResolvedValue({
        success: false,
        error: 'El imagen no es válida.',
      });

      const result = await service.execute(id_archivo, base64);

      expect(result.success).toBe(false);
      expect(result.error).toBe('El imagen no es válida.');
      expect(mockDeleteArchivo.execute).toHaveBeenCalled();
    });

    it('debe manejar errores al verificar existencia', async () => {
      const id_archivo = 'archivo123';
      const base64 = 'validBase64Image';

      mockArchivoRepository.existsById.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.execute(id_archivo, base64)).rejects.toThrow(
        'Database error',
      );
      expect(mockDeleteArchivo.execute).not.toHaveBeenCalled();
    });

    it('debe manejar errores al eliminar archivo', async () => {
      const id_archivo = 'archivo123';
      const base64 = 'validBase64Image';

      mockArchivoRepository.existsById.mockResolvedValue(true);
      mockDeleteArchivo.execute.mockRejectedValue(new Error('Delete error'));

      await expect(service.execute(id_archivo, base64)).rejects.toThrow(
        'Delete error',
      );
      expect(mockSaveImagen.execute).not.toHaveBeenCalled();
    });
  });

  describe('execute - Edge Cases', () => {
    it('debe propagar error de saveImagen correctamente', async () => {
      const id_archivo = 'archivo123';
      const base64 = 'validBase64Image';

      mockArchivoRepository.existsById.mockResolvedValue(true);
      mockDeleteArchivo.execute.mockResolvedValue({
        success: true,
        data: {},
      });
      mockSaveImagen.execute.mockResolvedValue({
        success: false,
        error: 'El tamaño máximo para imágenes es de 4MB.',
      });

      const result = await service.execute(id_archivo, base64);

      expect(result.success).toBe(false);
      expect(result.error).toBe('El tamaño máximo para imágenes es de 4MB.');
    });

    it('debe retornar data null si saveImagen no retorna data', async () => {
      const id_archivo = 'archivo123';
      const base64 = 'validBase64Image';

      mockArchivoRepository.existsById.mockResolvedValue(true);
      mockDeleteArchivo.execute.mockResolvedValue({
        success: true,
        data: {},
      });
      mockSaveImagen.execute.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await service.execute(id_archivo, base64);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });
});
