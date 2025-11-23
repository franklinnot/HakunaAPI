import { UpdateImagen } from '../../../src/modules/archivos/application/use-cases/update-imagen';
import { SaveImagen } from '../../../src/modules/archivos/application/use-cases/save-imagen';
import { DeleteArchivo } from '../../../src/modules/archivos/application/use-cases/delete-archivo';
import { crearRespuesta } from '../../../src/shared/application/response';

describe('UpdateImagen', () => {
  let service: UpdateImagen;
  let archivoRepository: any;
  let saveImagen: jest.Mocked<SaveImagen>;
  let deleteArchivo: jest.Mocked<DeleteArchivo>;

  beforeEach(() => {
    archivoRepository = {
      existsById: jest.fn(),
    };

    saveImagen = {
      execute: jest.fn(),
    } as any;

    deleteArchivo = {
      execute: jest.fn(),
    } as any;

    service = new UpdateImagen(archivoRepository, saveImagen, deleteArchivo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------
  // Caso exitoso (Happy Path)
  // -----------------------------
  it('debe actualizar una imagen correctamente', async () => {
    const id_archivo = 'img123';
    const base64 = 'fake-base64-data';
    const nombre = 'nueva-imagen.webp';

    const mockResponse = crearRespuesta({
      success: true,
      data: {
        id: 'nuevo123',
        nombre,
        link: 'https://s3.com/new-image.webp',
      },
    });

    archivoRepository.existsById.mockResolvedValue(true);
    deleteArchivo.execute.mockResolvedValue(crearRespuesta({ success: true }));
    saveImagen.execute.mockResolvedValue(mockResponse);

    const result = await service.execute(id_archivo, base64, nombre);

    expect(archivoRepository.existsById).toHaveBeenCalledWith(id_archivo);
    expect(deleteArchivo.execute).toHaveBeenCalledWith(id_archivo);
    expect(saveImagen.execute).toHaveBeenCalledWith(base64, nombre);
    expect(result.success).toBe(true);
    expect(result.data?.link).toBe('https://s3.com/new-image.webp');
  });

  // -----------------------------
  // Imagen no existe
  // -----------------------------
  it('debe retornar error si la imagen no existe', async () => {
    const id_archivo = 'inexistente';
    archivoRepository.existsById.mockResolvedValue(false);

    const result = await service.execute(id_archivo, 'base64');

    expect(result.success).toBe(false);
    expect(result.error).toBe('La imagen no existe.');
    expect(deleteArchivo.execute).not.toHaveBeenCalled();
    expect(saveImagen.execute).not.toHaveBeenCalled();
  });

  // -----------------------------
  // Error al guardar nueva imagen
  // -----------------------------
  it('debe retornar error si ocurre un fallo al guardar la nueva imagen', async () => {
    const id_archivo = 'img-error';
    const base64 = 'fake-base64';
    const nombre = 'imagen-falla.webp';

    archivoRepository.existsById.mockResolvedValue(true);
    deleteArchivo.execute.mockResolvedValue(crearRespuesta({ success: true }));
    saveImagen.execute.mockResolvedValue(
      crearRespuesta({
        success: false,
        error: 'Error al guardar la nueva imagen.',
      }),
    );

    const result = await service.execute(id_archivo, base64, nombre);

    expect(deleteArchivo.execute).toHaveBeenCalled();
    expect(saveImagen.execute).toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Error al guardar la nueva imagen.');
  });
});
