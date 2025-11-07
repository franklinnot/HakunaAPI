import { Test, TestingModule } from '@nestjs/testing';
import { SaveAudio } from '../../../src/modules/archivos/application/use-cases/save-audio';
import { StorageService } from '../../../src/modules/archivos/application/storage.service';
import { ArchivosUtils } from '../../../src/modules/archivos/application/archivos.utils';
import { TipoArchivo } from '../../../src/shared/domain/enums';

describe('SaveAudio', () => {
  let service: SaveAudio;
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
        SaveAudio,
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

    service = module.get<SaveAudio>(SaveAudio);
    archivoRepository = mockArchivoRepository;
    storageService = module.get<StorageService>(StorageService);
    archivosUtils = module.get<ArchivosUtils>(ArchivosUtils);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - Happy Path', () => {
    it('debe guardar un audio válido correctamente', async () => {
      const base64 = 'validBase64Audio';
      const nombre = 'audio-test';
      const mockBuffer = Buffer.from('audio data');
      const mockLink = 'https://storage.com/audio.mp3';
      const sizeMB = 2;

      mockArchivosUtils.getMimeType.mockResolvedValue('audio/mpeg');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      mockArchivosUtils.obtenerTamañoMB.mockReturnValue(sizeMB);
      mockStorageService.uploadFile.mockResolvedValue(mockLink);
      mockArchivoRepository.create.mockResolvedValue({
        _id: 'archivo123',
        nombre: nombre,
        tipo_archivo: TipoArchivo.AUDIO,
        extension: '.mp3',
        link: mockLink,
        size: `${sizeMB}MB`,
      });

      const result = await service.execute(base64, nombre);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockStorageService.uploadFile).toHaveBeenCalled();
      expect(mockArchivoRepository.create).toHaveBeenCalled();
    });

    it('debe guardar audio sin nombre', async () => {
      const base64 = 'validBase64Audio';
      const mockBuffer = Buffer.from('audio data');
      const mockLink = 'https://storage.com/audio.mp3';
      const sizeMB = 1.5;

      mockArchivosUtils.getMimeType.mockResolvedValue('audio/wav');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      mockArchivosUtils.obtenerTamañoMB.mockReturnValue(sizeMB);
      mockStorageService.uploadFile.mockResolvedValue(mockLink);
      mockArchivoRepository.create.mockResolvedValue({
        _id: 'archivo123',
        nombre: undefined,
        tipo_archivo: TipoArchivo.AUDIO,
        extension: '.mp3',
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
    it('debe fallar si el audio no es válido', async () => {
      const base64 = 'invalidBase64';

      mockArchivosUtils.getMimeType.mockResolvedValue(null);

      const result = await service.execute(base64);

      expect(result.success).toBe(false);
      expect(result.error).toBe('El audio no es válido.');
      expect(mockStorageService.uploadFile).not.toHaveBeenCalled();
    });

    it('debe fallar si el formato de audio no está permitido', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('audio data');

      mockArchivosUtils.getMimeType.mockResolvedValue('audio/ogg');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);

      const result = await service.execute(base64);

      expect(result.success).toBe(false);
      expect(result.error).toBe('El audio no es válido.');
    });

    it('debe fallar si el tamaño excede el máximo permitido', async () => {
      const base64 = 'validBase64Audio';
      const mockBuffer = Buffer.from('audio data');
      const sizeMB = 10; // Excede el máximo de 8MB

      mockArchivosUtils.getMimeType.mockResolvedValue('audio/mpeg');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      mockArchivosUtils.obtenerTamañoMB.mockReturnValue(sizeMB);

      const result = await service.execute(base64);

      expect(result.success).toBe(false);
      expect(result.error).toBe('El tamaño máximo para audios es de 8MB.');
      expect(mockStorageService.uploadFile).not.toHaveBeenCalled();
    });

    it('debe fallar si base64ToBuffer retorna null', async () => {
      const base64 = 'invalidBase64';

      mockArchivosUtils.getMimeType.mockResolvedValue('audio/mpeg');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(null);

      const result = await service.execute(base64);

      expect(result.success).toBe(false);
      expect(result.error).toBe('El audio no es válido.');
    });
  });

  describe('getAudioBuffer', () => {
    it('debe retornar buffer para audio/mpeg', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('audio data');

      mockArchivosUtils.getMimeType.mockResolvedValue('audio/mpeg');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);

      const result = await service.getAudioBuffer(base64);

      expect(result).toEqual(mockBuffer);
    });

    it('debe retornar buffer para audio/webm', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('audio data');

      mockArchivosUtils.getMimeType.mockResolvedValue('audio/webm');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);

      const result = await service.getAudioBuffer(base64);

      expect(result).toEqual(mockBuffer);
    });

    it('debe retornar buffer para video/webm', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('audio data');

      mockArchivosUtils.getMimeType.mockResolvedValue('video/webm');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);

      const result = await service.getAudioBuffer(base64);

      expect(result).toEqual(mockBuffer);
    });

    it('debe retornar null si mimeType es null', async () => {
      const base64 = 'invalidBase64';

      mockArchivosUtils.getMimeType.mockResolvedValue(null);

      const result = await service.getAudioBuffer(base64);

      expect(result).toBeNull();
    });

    it('debe retornar null si el formato no está permitido', async () => {
      const base64 = 'validBase64';

      mockArchivosUtils.getMimeType.mockResolvedValue('audio/flac');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(Buffer.from('data'));

      const result = await service.getAudioBuffer(base64);

      expect(result).toBeNull();
    });

    it('debe retornar null si base64ToBuffer retorna null', async () => {
      const base64 = 'invalidBase64';

      mockArchivosUtils.getMimeType.mockResolvedValue('audio/mpeg');
      mockArchivosUtils.base64ToBuffer.mockReturnValue(null);

      const result = await service.getAudioBuffer(base64);

      expect(result).toBeNull();
    });
  });
});
