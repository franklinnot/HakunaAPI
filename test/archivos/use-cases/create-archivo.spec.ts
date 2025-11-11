import { CreateArchivo } from 'src/modules/archivos/application/use-cases/create-archivo';
import { StorageService } from 'src/modules/archivos/application/storage.service';
import { ArchivosUtils } from 'src/modules/archivos/application/archivos.utils';
import { ArchivosMapper } from 'src/modules/archivos/application/archivos.mapper';
import { TipoArchivo } from 'src/shared/domain/enums';
import { crearRespuesta } from 'src/shared/application/response';

jest.mock('src/modules/archivos/application/archivos.mapper');
jest.mock('src/shared/application/response');

describe('CreateArchivo', () => {
  let createArchivo: CreateArchivo;
  let archivoRepository: any;
  let storageService: any;
  let archivosUtils: any;

  beforeEach(() => {
    archivoRepository = { create: jest.fn() };
    storageService = { uploadFile: jest.fn() };
    archivosUtils = { obtenerTamañoMB: jest.fn() };

    createArchivo = new CreateArchivo(
      archivoRepository,
      storageService,
      archivosUtils,
    );

    (ArchivosMapper.toArchivoResponse as jest.Mock).mockImplementation(
      (archivo) => archivo,
    );
    (crearRespuesta as jest.Mock).mockImplementation((obj) => obj);
  });

  // Caso correcto
  it('debe crear un archivo correctamente', async () => {
    const buffer = Buffer.from('data');
    const mimeType = 'image/png';
    const tipo_archivo = TipoArchivo.Imagen;
    const extension = 'png';
    const maxSize = 10;

    archivosUtils.obtenerTamañoMB.mockReturnValue(1);
    storageService.uploadFile.mockResolvedValue(
      'https://mocked-link.com/image.png',
    );
    archivoRepository.create.mockResolvedValue({
      id_archivo: '123',
      nombre: 'foto',
      tipo_archivo,
      extension,
      link: 'https://mocked-link.com/image.png',
    });

    const result = await createArchivo.execute(
      buffer,
      mimeType,
      tipo_archivo,
      extension,
      maxSize,
      'foto',
    );

    expect(archivosUtils.obtenerTamañoMB).toHaveBeenCalledWith(buffer);
    expect(storageService.uploadFile).toHaveBeenCalled();
    expect(archivoRepository.create).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data.link).toContain('mocked-link.com');
  });

  // Tamaño excedido
  it('debe retornar error si el archivo excede el tamaño máximo', async () => {
    archivosUtils.obtenerTamañoMB.mockReturnValue(15);

    const result = await createArchivo.execute(
      Buffer.from('data'),
      'image/png',
      TipoArchivo.Imagen,
      'png',
      10,
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('El tamaño máximo es de 10MB.');
    expect(storageService.uploadFile).not.toHaveBeenCalled();
    expect(archivoRepository.create).not.toHaveBeenCalled();
  });

  // Excepción inesperada
  it('debe retornar error si ocurre una excepción inesperada', async () => {
    archivosUtils.obtenerTamañoMB.mockReturnValue(1);
    storageService.uploadFile.mockRejectedValue(new Error('falló'));

    const result = await createArchivo.execute(
      Buffer.from('data'),
      'image/png',
      TipoArchivo.Imagen,
      'png',
      10,
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Ocurrió un error al procesar el archivo.');
  });

  // Nombre opcional
  it('debe usar null como nombre si no se proporciona', async () => {
    archivosUtils.obtenerTamañoMB.mockReturnValue(1);
    storageService.uploadFile.mockResolvedValue(
      'https://mocked-link.com/img.png',
    );
    archivoRepository.create.mockResolvedValue({
      id_archivo: '123',
      nombre: null,
      tipo_archivo: TipoArchivo.Imagen,
      extension: 'png',
    });

    const result = await createArchivo.execute(
      Buffer.from('data'),
      'image/png',
      TipoArchivo.Imagen,
      'png',
      10,
    );

    expect(archivoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: null }),
    );
    expect(result.success).toBe(true);
  });
});
