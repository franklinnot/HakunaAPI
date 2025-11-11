jest.mock('file-type', () => ({
  fileTypeFromBuffer: jest.fn().mockResolvedValue({
    ext: 'pdf',
    mime: 'application/pdf',
  }),
}));

import { SaveDocumento } from '../../../src/modules/archivos/application/use-cases/save-documento';
import { ArchivosUtils } from '../../../src/modules/archivos/application/archivos.utils';
import { TipoArchivo } from '../../../src/shared/domain/enums';
import { crearRespuesta } from '../../../src/shared/application/response';
import { fileTypeFromBuffer } from 'file-type';
import { CreateArchivo } from '../../../src/modules/archivos/application/use-cases/create-archivo';

describe('SaveDocumento', () => {
  let saveDocumento: SaveDocumento;
  let archivosUtils: jest.Mocked<ArchivosUtils>;
  let createArchivoCU: jest.Mocked<CreateArchivo>;

  beforeEach(() => {
    archivosUtils = {
      base64ToBuffer: jest.fn(),
    } as any;

    createArchivoCU = {
      execute: jest.fn(),
    } as any;

    saveDocumento = new SaveDocumento(archivosUtils, createArchivoCU);
    jest.clearAllMocks();
  });

  // Caso exitoso
  it('debe guardar un documento PDF correctamente', async () => {
    const mockBuffer = Buffer.from('fake-pdf-data');
    archivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);

    createArchivoCU.execute.mockResolvedValue(
      crearRespuesta({
        success: true,
        data: {
          url: 'https://fake-s3/pdf',
          nombre: 'test.pdf',
          tipo: TipoArchivo.DOCUMENTO,
        },
      }),
    );

    const result = await saveDocumento.execute('fake-base64', 'test.pdf');

    expect(archivosUtils.base64ToBuffer).toHaveBeenCalledWith('fake-base64');
    expect(fileTypeFromBuffer).toHaveBeenCalledWith(mockBuffer);
    expect(createArchivoCU.execute).toHaveBeenCalledWith(
      mockBuffer,
      'application/pdf',
      TipoArchivo.DOCUMENTO,
      'pdf',
      8,
      'test.pdf',
    );
    expect(result.success).toBe(true);
    expect(result.data?.tipo).toBe(TipoArchivo.DOCUMENTO);
  });

  // Tipo no permitido
  it('debe retornar error si el tipo de archivo no está permitido', async () => {
    (fileTypeFromBuffer as jest.Mock).mockResolvedValueOnce({
      ext: 'exe',
      mime: 'application/x-msdownload',
    });

    const mockBuffer = Buffer.from('fake-exe-data');
    archivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);

    const result = await saveDocumento.execute('fake-base64', 'virus.exe');

    expect(result.success).toBe(false);
    expect(result.error).toContain('no está permitido');
    expect(createArchivoCU.execute).not.toHaveBeenCalled();
  });

  // Buffer inválido
  it('debe retornar error si el base64 no se puede convertir a buffer', async () => {
    archivosUtils.base64ToBuffer.mockReturnValue(null);

    const result = await saveDocumento.execute('invalid-base64');

    expect(result.success).toBe(false);
    expect(result.error).toBe('El archivo no es válido o está corrupto.');
    expect(createArchivoCU.execute).not.toHaveBeenCalled();
  });

  // Error inesperado interno
  it('debe retornar error si ocurre una excepción inesperada', async () => {
    archivosUtils.base64ToBuffer.mockImplementation(() => {
      throw new Error('Falla interna');
    });

    const result = await saveDocumento.execute('fake-base64');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Error al procesar el documento');
  });

  // Tipo desconocido (sin fileType detectable)
  it('debe usar tipo por defecto application/octet-stream si no se detecta tipo', async () => {
    (fileTypeFromBuffer as jest.Mock).mockResolvedValueOnce(null);
    const mockBuffer = Buffer.from('fake-data');
    archivosUtils.base64ToBuffer.mockReturnValue(mockBuffer);

    createArchivoCU.execute.mockResolvedValue(
      crearRespuesta({
        success: true,
        data: { nombre: 'unknown.bin', tipo: TipoArchivo.DOCUMENTO },
      }),
    );

    const result = await saveDocumento.execute('fake-base64', 'unknown.bin');

    expect(createArchivoCU.execute).toHaveBeenCalledWith(
      mockBuffer,
      'application/octet-stream',
      TipoArchivo.DOCUMENTO,
      'bin',
      8,
      'unknown.bin',
    );
    expect(result.success).toBe(true);
  });
});
