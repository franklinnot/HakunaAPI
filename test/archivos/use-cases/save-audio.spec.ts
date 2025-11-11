import { Test, TestingModule } from '@nestjs/testing';
import { SaveAudio } from '../../../src/modules/archivos/application/use-cases/save-audio';
import { ArchivosUtils } from '../../../src/modules/archivos/application/archivos.utils';
import { CreateArchivo } from '../../../src/modules/archivos/application/use-cases/create-archivo';
import { TipoArchivo } from '../../../src/shared/domain/enums';
import { crearRespuesta } from '../../../src/shared/application/response';

describe('SaveAudio', () => {
  let service: SaveAudio;
  let archivosUtils: jest.Mocked<ArchivosUtils>;
  let createArchivoCU: jest.Mocked<CreateArchivo>;

  beforeEach(async () => {
    const mockArchivosUtils = {
      getBuffer: jest.fn(),
    };

    const mockCreateArchivo = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaveAudio,
        { provide: ArchivosUtils, useValue: mockArchivosUtils },
        { provide: CreateArchivo, useValue: mockCreateArchivo },
      ],
    }).compile();

    service = module.get<SaveAudio>(SaveAudio);
    archivosUtils = module.get(ArchivosUtils);
    createArchivoCU = module.get(CreateArchivo);
  });

  afterEach(() => jest.clearAllMocks());

  // ------------------------------------------------------------
  // Caso de ÉXITO
  // ------------------------------------------------------------
  it('debe guardar un audio correctamente', async () => {
    const base64 = 'data:audio/mpeg;base64,AAAA';
    const nombre = 'audio-test';
    const mockBuffer = Buffer.from('1234');

    archivosUtils.getBuffer.mockResolvedValue(mockBuffer);

    const mockResponse = crearRespuesta({
      success: true,
      data: {
        nombre: `${nombre}.mp3`,
        tipo_archivo: TipoArchivo.AUDIO,
        extension: 'mp3',
        link: 'https://storage.com/audio.mp3',
      },
    });

    createArchivoCU.execute.mockResolvedValue(mockResponse);

    const result = await service.execute(base64, nombre);

    expect(result.success).toBe(true);
    expect(result.data?.tipo_archivo).toBe(TipoArchivo.AUDIO);
    expect(archivosUtils.getBuffer).toHaveBeenCalledWith(
      base64,
      expect.arrayContaining(['audio/mpeg']),
    );
    expect(createArchivoCU.execute).toHaveBeenCalledWith(
      mockBuffer,
      'audio/mpeg',
      TipoArchivo.AUDIO,
      'mp3',
      8,
      nombre,
    );
  });

  // ------------------------------------------------------------
  // Casos de ERROR
  // ------------------------------------------------------------
  it('debe retornar error si el base64 no es válido o su formato no está permitido', async () => {
    archivosUtils.getBuffer.mockResolvedValue(null);

    const result = await service.execute(
      'data:image/png;base64,XXXX',
      'audioX',
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      'El audio no es válido o su formato no está permitido.',
    );
    expect(createArchivoCU.execute).not.toHaveBeenCalled();
  });

  it('debe retornar error si getBuffer lanza una excepción', async () => {
    archivosUtils.getBuffer.mockRejectedValue(new Error('Falla interna'));

    const result = await service.execute('data:audio/mpeg;base64,XXX');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Error al procesar el audio');
  });

  it('debe propagar error si createArchivoCU falla internamente', async () => {
    const base64 = 'data:audio/mpeg;base64,AAAA';
    const mockBuffer = Buffer.from('bytes');

    archivosUtils.getBuffer.mockResolvedValue(mockBuffer);
    createArchivoCU.execute.mockResolvedValue(
      crearRespuesta({
        success: false,
        error: 'Error al guardar archivo.',
      }),
    );

    const result = await service.execute(base64);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Error al guardar archivo.');
  });

  // ------------------------------------------------------------
  // ⚙️ Casos adicionales
  // ------------------------------------------------------------
  it('debe aceptar ejecución sin nombre', async () => {
    const base64 = 'data:audio/mpeg;base64,AAAA';
    const mockBuffer = Buffer.from('AAA');

    archivosUtils.getBuffer.mockResolvedValue(mockBuffer);

    createArchivoCU.execute.mockResolvedValue(
      crearRespuesta({
        success: true,
        data: { nombre: 'default.mp3' },
      }),
    );

    const result = await service.execute(base64);

    expect(result.success).toBe(true);
    expect(createArchivoCU.execute).toHaveBeenCalledWith(
      mockBuffer,
      'audio/mpeg',
      TipoArchivo.AUDIO,
      'mp3',
      8,
      undefined,
    );
  });

  it('debe pasar correctamente los formatos permitidos a getBuffer', async () => {
    const base64 = 'data:audio/webm;base64,AAAA';
    const mockBuffer = Buffer.from('bytes');

    archivosUtils.getBuffer.mockResolvedValue(mockBuffer);
    createArchivoCU.execute.mockResolvedValue(
      crearRespuesta({ success: true }),
    );

    await service.execute(base64);

    const allowedFormats = service['allowedFormats'];
    expect(archivosUtils.getBuffer).toHaveBeenCalledWith(
      base64,
      allowedFormats,
    );
  });
});
