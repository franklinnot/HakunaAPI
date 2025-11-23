jest.mock('sharp', () => {
  const toBuffer = jest.fn().mockResolvedValue(Buffer.from('fake-webp-buffer'));
  const mockSharp = jest.fn(() => ({
    webp: jest.fn(() => ({ toBuffer })),
  }));
  mockSharp.toBuffer = toBuffer;
  return mockSharp;
});

import { SaveImagen } from '../../../src/modules/archivos/application/use-cases/save-imagen';
import { ArchivosUtils } from '../../../src/modules/archivos/application/archivos.utils';
import { TipoArchivo } from '../../../src/shared/domain/enums';
import { crearRespuesta } from '../../../src/shared/application/response';
import { CreateArchivo } from '../../../src/modules/archivos/application/use-cases/create-archivo';
import sharp from 'sharp';

describe('SaveImagen', () => {
  let saveImagen: SaveImagen;
  let archivosUtils: jest.Mocked<ArchivosUtils>;
  let createArchivoCU: jest.Mocked<CreateArchivo>;

  beforeEach(() => {
    archivosUtils = {
      getBuffer: jest.fn(),
    } as any;

    createArchivoCU = {
      execute: jest.fn(),
    } as any;

    saveImagen = new SaveImagen(archivosUtils, createArchivoCU);
    jest.clearAllMocks();
  });

  //Caso exitoso
  it('debe guardar una imagen correctamente', async () => {
    const mockBuffer = Buffer.from('fake-image-data');
    archivosUtils.getBuffer.mockResolvedValue(mockBuffer);

    createArchivoCU.execute.mockResolvedValue(
      crearRespuesta({
        success: true,
        data: {
          id: '123',
          nombre: 'imagen.webp',
          url: 'http://localhost/imagen.webp',
        },
      }),
    );

    const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...';
    const result = await saveImagen.execute(base64, 'imagen');

    expect(archivosUtils.getBuffer).toHaveBeenCalledWith(base64, [
      'image/webp',
      'image/png',
      'image/jpeg',
      'image/svg+xml',
    ]);

    expect(sharp).toHaveBeenCalledWith(mockBuffer);

    expect(createArchivoCU.execute).toHaveBeenCalledWith(
      expect.any(Buffer),
      'image/webp',
      TipoArchivo.IMAGEN,
      'webp',
      4,
      'imagen',
    );

    expect(result.success).toBe(true);
    expect(result.data?.nombre).toBe('imagen.webp');
  });

  //Imagen no válida
  it('debe retornar error si la imagen no es válida', async () => {
    archivosUtils.getBuffer.mockResolvedValue(null as any);

    const result = await saveImagen.execute('invalid-base64');

    expect(result.success).toBe(false);
    expect(result.error).toBe('La imagen no es válida.');
    expect(createArchivoCU.execute).not.toHaveBeenCalled();
  });

  //Error interno
  it('debe retornar error si ocurre una excepción inesperada', async () => {
    archivosUtils.getBuffer.mockRejectedValue(new Error('Error interno'));

    const result = await saveImagen.execute('fake-base64');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Error al procesar la imagen');
  });

  //Verifica que el buffer sea convertido a webp con sharp
  it('debe convertir la imagen a formato webp antes de guardar', async () => {
    const mockBuffer = Buffer.from('fake-img');
    archivosUtils.getBuffer.mockResolvedValue(mockBuffer);

    await saveImagen.execute('data:image/jpeg;base64,XYZ', 'foto');

    const sharpMock = sharp as jest.Mock;
    const webpInstance = sharpMock.mock.results[0].value;
    expect(webpInstance.webp).toHaveBeenCalledWith({ quality: 80 });
    expect(webpInstance.webp().toBuffer).toHaveBeenCalled();
  });
});
