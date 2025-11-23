import { UpdateFotoGrupal } from 'src/modules/chats/application/use-cases/update-chat-grupal/update-foto-grupal';

describe('UpdateFotoGrupal Use Case', () => {
  let useCase: UpdateFotoGrupal;
  let chatRepository: any;
  let archivosService: any;
  let archivoRepository: any;

  beforeEach(() => {
    chatRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    archivosService = {
      saveImagen: jest.fn(),
      deleteArchivo: jest.fn(),
      updateImagen: jest.fn(),
    };
    archivoRepository = {
      findLinkById: jest.fn(),
    };

    useCase = new UpdateFotoGrupal(
      chatRepository,
      archivosService,
      archivoRepository,
    );
  });

  // ---------------------------------------------------------------------------
  it('✅ debe guardar nueva foto si el chat no tenía foto anterior', async () => {
    chatRepository.findById.mockResolvedValue({ id_foto: null });
    archivoRepository.findLinkById.mockResolvedValue(null);

    archivosService.saveImagen.mockResolvedValue({
      data: { id_archivo: 'new123', link: 'https://foto-nueva.jpg' },
      success: true,
      error: null,
    });

    const result = await useCase.execute('chat1', 'fotoBase64');

    expect(archivosService.saveImagen).toHaveBeenCalledWith('fotoBase64');
    expect(chatRepository.update).toHaveBeenCalledWith('chat1', {
      id_foto: 'new123',
    });
    expect(result).toBe('https://foto-nueva.jpg');
  });

  // ---------------------------------------------------------------------------
  it('🗑️ debe eliminar la foto si ya tenía una y no llega nueva', async () => {
    chatRepository.findById.mockResolvedValue({ id_foto: 'old123' });
    archivoRepository.findLinkById.mockResolvedValue('https://foto-vieja.jpg');

    const result = await useCase.execute('chat1', null);

    expect(archivosService.deleteArchivo).toHaveBeenCalledWith('old123');
    expect(chatRepository.update).toHaveBeenCalledWith('chat1', {
      id_foto: null,
    });
    expect(result).toBeNull();
  });

  // ---------------------------------------------------------------------------
  it('🔁 debe reemplazar la foto si ya tenía una y llega una nueva', async () => {
    chatRepository.findById.mockResolvedValue({ id_foto: 'old123' });
    archivoRepository.findLinkById.mockResolvedValue('https://foto-vieja.jpg');

    archivosService.updateImagen.mockResolvedValue({
      data: { id_archivo: 'old123', link: 'https://foto-nueva.jpg' },
      success: true,
      error: null,
    });

    const result = await useCase.execute('chat1', 'nuevaBase64');

    expect(archivosService.updateImagen).toHaveBeenCalledWith(
      'old123',
      'nuevaBase64',
    );
    expect(result).toBe('https://foto-nueva.jpg');
  });

  // ---------------------------------------------------------------------------
  it('🚫 no debe hacer nada si no hay foto anterior y no llega una nueva', async () => {
    chatRepository.findById.mockResolvedValue({ id_foto: null });
    archivoRepository.findLinkById.mockResolvedValue(null);

    const result = await useCase.execute('chat1', null);

    expect(archivosService.saveImagen).not.toHaveBeenCalled();
    expect(archivosService.deleteArchivo).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
