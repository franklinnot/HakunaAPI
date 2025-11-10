jest.mock('file-type', () => ({
  fromBuffer: jest.fn(async (buffer) => {
    if (buffer.includes('PDF')) return { ext: 'pdf', mime: 'application/pdf' };
    if (buffer.includes('DOCX')) return { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
    if (buffer.includes('XLSX')) return { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
    return { ext: 'txt', mime: 'text/plain' };
  }),
}));
import * as FileType from 'file-type';

import { Test, TestingModule } from '@nestjs/testing';
import { SaveDocumento } from '../../../src/modules/archivos/application/use-cases/save-documento';
import { StorageService } from '../../../src/modules/archivos/application/storage.service';
import { ArchivosUtils } from '../../../src/modules/archivos/application/archivos.utils';
import { TipoArchivo } from '../../../src/shared/domain/enums';



describe('SaveDocumento', () => {
  let service: SaveDocumento;
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
    base64ToBuffer: jest.fn(),
    obtenerTamañoMB: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaveDocumento,
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

    service = module.get<SaveDocumento>(SaveDocumento);
    archivoRepository = mockArchivoRepository;
    storageService = module.get<StorageService>(StorageService);
    archivosUtils = module.get<ArchivosUtils>(ArchivosUtils);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - Happy Path', () => {
    it('debe guardar un documento PDF correctamente', async () => {
      const base64 = 'validBase64PDF';
      const nombre = 'documento-test';
      const mockBuffer = Buffer.from('pdf data');
      const mockLink = 'https://storage.com/doc.pdf';
      const sizeMB = 2;

      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      (FileType.fromBuffer as jest.Mock).mockResolvedValue({
        mime: 'application/pdf',
        ext: 'pdf',
      });
      mockArchivosUtils.obtenerTamañoMB.mockReturnValue(sizeMB);
      mockStorageService.uploadFile.mockResolvedValue(mockLink);
      mockArchivoRepository.create.mockResolvedValue({
        _id: 'archivo123',
        nombre: nombre,
        tipo_archivo: TipoArchivo.DOCUMENTO,
        extension: '.pdf',
        link: mockLink,
        size: `${sizeMB}MB`,
      });

      const result = await service.execute(base64, nombre);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockStorageService.uploadFile).toHaveBeenCalledWith(
        expect.stringContaining('Documento/'),
        mockBuffer,
        'application/pdf',
      );
      expect(mockArchivoRepository.create).toHaveBeenCalled();
    });

    it('debe guardar documento Word (.docx)', async () => {
      const base64 = 'validBase64DOCX';
      const mockBuffer = Buffer.from('docx data');
      const mockLink = 'https://storage.com/doc.docx';
      const sizeMB = 1.5;

      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      (FileType.fromBuffer as jest.Mock).mockResolvedValue({
        mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ext: 'docx',
      });
      mockArchivosUtils.obtenerTamañoMB.mockReturnValue(sizeMB);
      mockStorageService.uploadFile.mockResolvedValue(mockLink);
      mockArchivoRepository.create.mockResolvedValue({
        _id: 'archivo123',
        nombre: null,
        tipo_archivo: TipoArchivo.DOCUMENTO,
        extension: '.docx',
        link: mockLink,
        size: `${sizeMB}MB`,
      });

      const result = await service.execute(base64);

      expect(result.success).toBe(true);
    });

    it('debe guardar documento Excel (.xlsx)', async () => {
      const base64 = 'validBase64XLSX';
      const mockBuffer = Buffer.from('xlsx data');
      const mockLink = 'https://storage.com/doc.xlsx';
      const sizeMB = 3;

      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      (FileType.fromBuffer as jest.Mock).mockResolvedValue({
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ext: 'xlsx',
      });
      mockArchivosUtils.obtenerTamañoMB.mockReturnValue(sizeMB);
      mockStorageService.uploadFile.mockResolvedValue(mockLink);
      mockArchivoRepository.create.mockResolvedValue({
        _id: 'archivo123',
        nombre: 'excel-doc',
        tipo_archivo: TipoArchivo.DOCUMENTO,
        extension: '.xlsx',
        link: mockLink,
        size: `${sizeMB}MB`,
      });

      const result = await service.execute(base64, 'excel-doc');

      expect(result.success).toBe(true);
    });

    it('debe guardar documento con tipo fallback (application/octet-stream)', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('data');
      const mockLink = 'https://storage.com/doc';
      const sizeMB = 1;

      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      (FileType.fromBuffer as jest.Mock).mockResolvedValue({
        mime: 'application/octet-stream',
        ext: 'bin',
      });
      mockArchivosUtils.obtenerTamañoMB.mockReturnValue(sizeMB);
      mockStorageService.uploadFile.mockResolvedValue(mockLink);
      mockArchivoRepository.create.mockResolvedValue({
        _id: 'archivo123',
        nombre: null,
        tipo_archivo: TipoArchivo.DOCUMENTO,
        extension: '.bin',
        link: mockLink,
        size: `${sizeMB}MB`,
      });

      const result = await service.execute(base64);

      expect(result.success).toBe(true);
    });

    it('debe guardar documento sin extensión detectada', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('data');
      const mockLink = 'https://storage.com/doc';
      const sizeMB = 1;

      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      (FileType.fromBuffer as jest.Mock).mockResolvedValue(null);
      mockArchivosUtils.obtenerTamañoMB.mockReturnValue(sizeMB);
      mockStorageService.uploadFile.mockResolvedValue(mockLink);
      mockArchivoRepository.create.mockResolvedValue({
        _id: 'archivo123',
        nombre: null,
        tipo_archivo: TipoArchivo.DOCUMENTO,
        extension: '',
        link: mockLink,
        size: `${sizeMB}MB`,
      });

      const result = await service.execute(base64);

      expect(result.success).toBe(true);
      expect(mockStorageService.uploadFile).toHaveBeenCalledWith(
        expect.any(String),
        mockBuffer,
        'application/octet-stream',
      );
    });
  });

  describe('execute - Sad Paths', () => {
    it('debe fallar si el base64 no es válido', async () => {
      const base64 = 'invalidBase64';

      mockArchivosUtils.base64ToBuffer.mockReturnValue(null);

      const result = await service.execute(base64);

      expect(result.success).toBe(false);
      expect(result.error).toBe('El archivo no es un base64 válido.');
      expect(mockStorageService.uploadFile).not.toHaveBeenCalled();
    });

    it('debe fallar si el tipo de documento no está soportado', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('data');

      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      (FileType.fromBuffer as jest.Mock).mockResolvedValue({
        mime: 'video/mp4',
        ext: 'mp4',
      });

      const result = await service.execute(base64);

      expect(result.success).toBe(false);
      expect(result.error).toBe('El tipo de documento no es soportado.');
      expect(mockStorageService.uploadFile).not.toHaveBeenCalled();
    });

    it('debe fallar si el mime type es image/png', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('data');

      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      (FileType.fromBuffer as jest.Mock).mockResolvedValue({
        mime: 'image/png',
        ext: 'png',
      });

      const result = await service.execute(base64);

      expect(result.success).toBe(false);
      expect(result.error).toBe('El tipo de documento no es soportado.');
    });
  });

  describe('execute - Branches Coverage', () => {
    it('debe manejar documento .doc (Word antiguo)', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('doc data');
      const mockLink = 'https://storage.com/doc.doc';
      const sizeMB = 2;

      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      (FileType.fromBuffer as jest.Mock).mockResolvedValue({
        mime: 'application/msword',
        ext: 'doc',
      });
      mockArchivosUtils.obtenerTamañoMB.mockReturnValue(sizeMB);
      mockStorageService.uploadFile.mockResolvedValue(mockLink);
      mockArchivoRepository.create.mockResolvedValue({
        _id: 'archivo123',
        nombre: null,
        tipo_archivo: TipoArchivo.DOCUMENTO,
        extension: '.doc',
        link: mockLink,
        size: `${sizeMB}MB`,
      });

      const result = await service.execute(base64);

      expect(result.success).toBe(true);
    });

    it('debe manejar documento .xls (Excel antiguo)', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('xls data');
      const mockLink = 'https://storage.com/doc.xls';
      const sizeMB = 2;

      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      (FileType.fromBuffer as jest.Mock).mockResolvedValue({
        mime: 'application/vnd.ms-excel',
        ext: 'xls',
      });
      mockArchivosUtils.obtenerTamañoMB.mockReturnValue(sizeMB);
      mockStorageService.uploadFile.mockResolvedValue(mockLink);
      mockArchivoRepository.create.mockResolvedValue({
        _id: 'archivo123',
        nombre: null,
        tipo_archivo: TipoArchivo.DOCUMENTO,
        extension: '.xls',
        link: mockLink,
        size: `${sizeMB}MB`,
      });

      const result = await service.execute(base64);

      expect(result.success).toBe(true);
    });

    it('debe manejar documento .ppt (PowerPoint antiguo)', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('ppt data');
      const mockLink = 'https://storage.com/doc.ppt';
      const sizeMB = 2;

      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      (FileType.fromBuffer as jest.Mock).mockResolvedValue({
        mime: 'application/vnd.ms-powerpoint',
        ext: 'ppt',
      });
      mockArchivosUtils.obtenerTamañoMB.mockReturnValue(sizeMB);
      mockStorageService.uploadFile.mockResolvedValue(mockLink);
      mockArchivoRepository.create.mockResolvedValue({
        _id: 'archivo123',
        nombre: null,
        tipo_archivo: TipoArchivo.DOCUMENTO,
        extension: '.ppt',
        link: mockLink,
        size: `${sizeMB}MB`,
      });

      const result = await service.execute(base64);

      expect(result.success).toBe(true);
    });

    it('debe manejar documento .pptx (PowerPoint nuevo)', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('pptx data');
      const mockLink = 'https://storage.com/doc.pptx';
      const sizeMB = 2;

      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      (FileType.fromBuffer as jest.Mock).mockResolvedValue({
        mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ext: 'pptx',
      });
      mockArchivosUtils.obtenerTamañoMB.mockReturnValue(sizeMB);
      mockStorageService.uploadFile.mockResolvedValue(mockLink);
      mockArchivoRepository.create.mockResolvedValue({
        _id: 'archivo123',
        nombre: null,
        tipo_archivo: TipoArchivo.DOCUMENTO,
        extension: '.pptx',
        link: mockLink,
        size: `${sizeMB}MB`,
      });

      const result = await service.execute(base64);

      expect(result.success).toBe(true);
    });

    it('debe manejar archivo .txt', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('text data');
      const mockLink = 'https://storage.com/doc.txt';
      const sizeMB = 0.5;

      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      (FileType.fromBuffer as jest.Mock).mockResolvedValue({
        mime: 'text/plain',
        ext: 'txt',
      });
      mockArchivosUtils.obtenerTamañoMB.mockReturnValue(sizeMB);
      mockStorageService.uploadFile.mockResolvedValue(mockLink);
      mockArchivoRepository.create.mockResolvedValue({
        _id: 'archivo123',
        nombre: null,
        tipo_archivo: TipoArchivo.DOCUMENTO,
        extension: '.txt',
        link: mockLink,
        size: `${sizeMB}MB`,
      });

      const result = await service.execute(base64);

      expect(result.success).toBe(true);
    });

    it('debe manejar archivo .zip', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('zip data');
      const mockLink = 'https://storage.com/doc.zip';
      const sizeMB = 5;

      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      (FileType.fromBuffer as jest.Mock).mockResolvedValue({
        mime: 'application/zip',
        ext: 'zip',
      });
      mockArchivosUtils.obtenerTamañoMB.mockReturnValue(sizeMB);
      mockStorageService.uploadFile.mockResolvedValue(mockLink);
      mockArchivoRepository.create.mockResolvedValue({
        _id: 'archivo123',
        nombre: null,
        tipo_archivo: TipoArchivo.DOCUMENTO,
        extension: '.zip',
        link: mockLink,
        size: `${sizeMB}MB`,
      });

      const result = await service.execute(base64);

      expect(result.success).toBe(true);
    });

    it('debe manejar archivo .rar', async () => {
      const base64 = 'validBase64';
      const mockBuffer = Buffer.from('rar data');
      const mockLink = 'https://storage.com/doc.rar';
      const sizeMB = 5;

      mockArchivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);
      (FileType.fromBuffer as jest.Mock).mockResolvedValue({
        mime: 'application/x-rar-compressed',
        ext: 'rar',
      });
      mockArchivosUtils.obtenerTamañoMB.mockReturnValue(sizeMB);
      mockStorageService.uploadFile.mockResolvedValue(mockLink);
      mockArchivoRepository.create.mockResolvedValue({
        _id: 'archivo123',
        nombre: null,
        tipo_archivo: TipoArchivo.DOCUMENTO,
        extension: '.rar',
        link: mockLink,
        size: `${sizeMB}MB`,
      });

      const result = await service.execute(base64);

      expect(result.success).toBe(true);
    });
  });
});
