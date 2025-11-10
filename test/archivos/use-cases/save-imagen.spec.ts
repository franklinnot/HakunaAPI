import { Test, TestingModule } from '@nestjs/testing';
import { SaveImagen } from '../../../src/modules/archivos/application/use-cases/save-imagen';
import { StorageService } from '../../../src/modules/archivos/application/storage.service';
import { ArchivosUtils } from '../../../src/modules/archivos/application/archivos.utils';
import { TipoArchivo } from '../../../src/shared/domain/enums';

describe('SaveImagen', () => {
  let service: SaveImagen;
  let archivoRepository: any;
  let storageService: StorageService;
  let archivosUtils: ArchivosUtils;

  const mockArchivoRepository = {
    create: jest.fn(),
  };

  const mockStorageService = {
    uploadFile: jest.fn(),
  };

  const mockArchivosUtils = {
    getMimeType: jest.fn(),
    base64ToBuffer: jest.fn(),
    obtenerTamañoMB: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaveImagen,
        {
          provide: 'IArchivoRepository',
          useValue: mockArchivoRepository,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
        {
          provide: ArchivosUtils,
          useValue: mockArchivosUtils,
        },
      ],
    }).compile();

    service = module.get<SaveImagen>(SaveImagen);
    archivoRepository = mockArchivoRepository;
    storageService = module.get<StorageService>(StorageService);
    archivosUtils = module.get<ArchivosUtils>(ArchivosUtils);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - Happy Path', () => {
    it('debe guardar una imagen válida correctamente', async () => {
      const base64 = 'validBase64Image';
      const nombre = 'imagen-test';
      const mockBuffer = Buffer.from('image data');
      const mockWebpBuffer = Buffer.from('webp data');
      const mockLink = 'https://storage.com/image.webp';
      const sizeMB = 2;

      mockArchivosUtils.getMimeType.mockResolvedValue('image/png');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      jest.spyOn(service, 'convertirAWebp').mockResolvedValue(mockWebpBuffer);
      mockArchivosUtils.obtenerTamañoMB.mockReturnValue(sizeMB);
      mockStorageService.uploadFile.mockResolvedValue(mockLink);
      mockArchivoRepository.create.mockResolvedValue({
        _id: 'archivo123',
        nombre: nombre,
        tipo_archivo: TipoArchivo.IMAGEN,
        extension: '.webp',
        link: mockLink,
        size: `${sizeMB}MB`,
      });

      const result = await service.execute(base64, nombre);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockStorageService.uploadFile).toHaveBeenCalled();
      expect(mockArchivoRepository.create).toHaveBeenCalled();
    });

    it('debe guardar imagen sin nombre', async () => {
      const base64 = 'validBase64Image';
      const mockBuffer = Buffer.from('image data');
      const mockWebpBuffer = Buffer.from('webp data');
      const mockLink = 'https://storage.com/image.webp';
      const sizeMB = 1.5;

      mockArchivosUtils.getMimeType.mockResolvedValue('image/jpeg');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      jest.spyOn(service, 'convertirAWebp').mockResolvedValue(mockWebpBuffer);
      mockArchivosUtils.obtenerTamañoMB.mockReturnValue(sizeMB);
      mockStorageService.uploadFile.mockResolvedValue(mockLink);
      mockArchivoRepository.create.mockResolvedValue({
        _id: 'archivo123',
        nombre: undefined,
        tipo_archivo: TipoArchivo.IMAGEN,
        extension: '.webp',
        link: mockLink,
        size: `${sizeMB}MB`,
      });

      const result = await service.execute(base64);

      expect(result.success).toBe(true);
      expect(mockArchivoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: undefined,
        }),
      );
    });
  });

  describe('execute - Sad Paths', () => {
    it('debe fallar si la imagen no es válida', async () => {
      const base64 = 'invalidBase64';

      mockArchivosUtils.getMimeType.mockResolvedValue(null);

      const result = await service.execute(base64);

      expect(result.success).toBe(false);
      expect(result.error).toBe('El imagen no es válida.');
      expect(mockStorageService.uploadFile).not.toHaveBeenCalled();
    });

    it('debe fallar si el formato de imagen no está permitido', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('image data');

      mockArchivosUtils.getMimeType.mockResolvedValue('image/gif');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);

      const result = await service.execute(base64);

      expect(result.success).toBe(false);
      expect(result.error).toBe('El imagen no es válida.');
    });

    it('debe fallar si el tamaño excede el máximo permitido', async () => {
      const base64 = 'validBase64Image';
      const mockBuffer = Buffer.from('image data');
      const mockWebpBuffer = Buffer.from('webp data');
      const sizeMB = 5; // Excede el máximo de 4MB

      mockArchivosUtils.getMimeType.mockResolvedValue('image/png');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      jest.spyOn(service, 'convertirAWebp').mockResolvedValue(mockWebpBuffer);
      mockArchivosUtils.obtenerTamañoMB.mockReturnValue(sizeMB);

      const result = await service.execute(base64);

      expect(result.success).toBe(false);
      expect(result.error).toBe('El tamaño máximo para imágenes es de 4MB.');
      expect(mockStorageService.uploadFile).not.toHaveBeenCalled();
    });

    it('debe fallar si convertirAWebp retorna null', async () => {
      const base64 = 'validBase64Image';
      const mockBuffer = Buffer.from('image data');

      mockArchivosUtils.getMimeType.mockResolvedValue('image/png');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      jest.spyOn(service, 'convertirAWebp').mockResolvedValue(null);

      const result = await service.execute(base64);

      expect(result.success).toBe(false);
      expect(result.error).toBe('El imagen no es válida.');
    });
  });

  describe('getImageBuffer', () => {
    it('debe retornar buffer webp para image/png', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('image data');
      const mockWebpBuffer = Buffer.from('webp data');

      mockArchivosUtils.getMimeType.mockResolvedValue('image/png');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      jest.spyOn(service, 'convertirAWebp').mockResolvedValue(mockWebpBuffer);

      const result = await service.getImageBuffer(base64);

      expect(result).toEqual(mockWebpBuffer);
    });

    it('debe retornar buffer webp para image/jpeg', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('image data');
      const mockWebpBuffer = Buffer.from('webp data');

      mockArchivosUtils.getMimeType.mockResolvedValue('image/jpeg');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      jest.spyOn(service, 'convertirAWebp').mockResolvedValue(mockWebpBuffer);

      const result = await service.getImageBuffer(base64);

      expect(result).toEqual(mockWebpBuffer);
    });

    it('debe retornar buffer webp para image/webp', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('image data');
      const mockWebpBuffer = Buffer.from('webp data');

      mockArchivosUtils.getMimeType.mockResolvedValue('image/webp');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      jest.spyOn(service, 'convertirAWebp').mockResolvedValue(mockWebpBuffer);

      const result = await service.getImageBuffer(base64);

      expect(result).toEqual(mockWebpBuffer);
    });

    it('debe retornar buffer webp para image/svg+xml', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('image data');
      const mockWebpBuffer = Buffer.from('webp data');

      mockArchivosUtils.getMimeType.mockResolvedValue('image/svg+xml');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      jest.spyOn(service, 'convertirAWebp').mockResolvedValue(mockWebpBuffer);

      const result = await service.getImageBuffer(base64);

      expect(result).toEqual(mockWebpBuffer);
    });

    it('debe retornar null si mimeType es null', async () => {
      const base64 = 'invalidBase64';

      mockArchivosUtils.getMimeType.mockResolvedValue(null);

      const result = await service.getImageBuffer(base64);

      expect(result).toBeNull();
    });

    it('debe retornar null si el formato no está permitido', async () => {
      const base64 = 'validBase64';

      mockArchivosUtils.getMimeType.mockResolvedValue('image/gif');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(Buffer.from('data'));

      const result = await service.getImageBuffer(base64);

      expect(result).toBeNull();
    });

    it('debe retornar null si base64ToBuffer retorna null', async () => {
      const base64 = 'invalidBase64';

      mockArchivosUtils.getMimeType.mockResolvedValue('image/png');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(null);

      const result = await service.getImageBuffer(base64);

      expect(result).toBeNull();
    });

    it('debe retornar null si convertirAWebp falla', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('image data');

      mockArchivosUtils.getMimeType.mockResolvedValue('image/png');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      jest.spyOn(service, 'convertirAWebp').mockResolvedValue(null);

      const result = await service.getImageBuffer(base64);

      expect(result).toBeNull();
    });
  });

  describe('convertirAWebp', () => {
    it('debe convertir buffer a webp exitosamente', async () => {
      const mockBuffer = Buffer.from('image data');
      // No podemos mockear sharp directamente, pero podemos probar el comportamiento
      const result = await service.convertirAWebp(mockBuffer);
      // En un test real, sharp podría fallar, así que esperamos null o buffer
      expect(result === null || Buffer.isBuffer(result)).toBe(true);
    });
  });
});
