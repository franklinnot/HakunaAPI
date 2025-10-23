import { TipoArchivo, Estado } from 'src/shared/domain/enums';
import { crearRespuesta } from 'src/shared/application/response';
import { SendMensajePrivado } from 'src/modules/mensajes/application/use-cases/send-mensaje-privado';

describe('SendMensajePrivado', () => {
  let sendMensajePrivadoCU: SendMensajePrivado;

  // MOCKS DE DEPENDENCIAS
  let chatRepository: any;
  let integranteRepository: any;
  let mensajeRepository: any;
  let viewerRepository: any;
  let detalleRepository: any;
  let archivosService: any;
  let chatsService: any;

  const usuarioMock = { _id: 'userA' } as any;

  beforeEach(() => {
    // Arrange: Inicialización de mocks uwu
    chatRepository = { findChatPrivadoByIdUsuarios: jest.fn() };
    integranteRepository = { findOne: jest.fn(), findAll: jest.fn() };
    mensajeRepository = { create: jest.fn() };
    viewerRepository = { registrarViewers: jest.fn() };
    detalleRepository = { create: jest.fn() };
    archivosService = { saveImagen: jest.fn() };
    chatsService = { crearChatPrivado: jest.fn() };

    sendMensajePrivadoCU = new SendMensajePrivado(
      chatRepository,
      integranteRepository,
      mensajeRepository,
      viewerRepository,
      detalleRepository,
      archivosService,
      chatsService,
    );

    jest.clearAllMocks();
  });

  // ----------------------------
  // TESTS DE FALLO
  // ----------------------------

  it('sendMensajePrivado -> fallo (mensaje vacío)', async () => {
    // Act
    const result = await sendMensajePrivadoCU.execute(usuarioMock, 'userB');

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toContain('vacío');
  });

  it('sendMensajePrivado -> fallo (envío a sí mismo)', async () => {
    // Act
    const result = await sendMensajePrivadoCU.execute(usuarioMock, 'userA', 'Hola');

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toContain('sí mismo');
  });

  it('sendMensajePrivado -> fallo (sin integrante habilitado)', async () => {
    // Arrange
    chatRepository.findChatPrivadoByIdUsuarios.mockResolvedValue({ _id: 'chat1' });
    integranteRepository.findOne.mockResolvedValue(null);

    // Act
    const result = await sendMensajePrivadoCU.execute(usuarioMock, 'userB', 'Hola');

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toContain('integrante');
  });

  // ----------------------------
  // TESTS DE ÉXITO
  // ----------------------------

  it('sendMensajePrivado -> éxito (crea chat si no existe)', async () => {
    // Arrange
    chatRepository.findChatPrivadoByIdUsuarios.mockResolvedValue(null);
    chatsService.crearChatPrivado.mockResolvedValue(
      crearRespuesta({ success: true, data: { id_chat: 'chat1' } }),
    );
    integranteRepository.findOne.mockResolvedValue({ _id: 'int1' });
    integranteRepository.findAll.mockResolvedValue([
      { _id: 'int1', id_usuario: 'userA' },
      { _id: 'int2', id_usuario: 'userB' },
    ]);
    mensajeRepository.create.mockResolvedValue({
      _id: 'msg1',
      createdAt: new Date(),
      estado: Estado.HABILITADO,
    });
    viewerRepository.registrarViewers.mockResolvedValue(undefined);

    // Act
    const result = await sendMensajePrivadoCU.execute(usuarioMock, 'userB', 'Hola mundo');

    // Assert
    expect(result.success).toBe(true);
    expect(chatsService.crearChatPrivado).toHaveBeenCalled();
    expect(result.data?.descripcion).toBe('Hola mundo');
  });

  it('sendMensajePrivado -> éxito (envía imágenes adjuntas)', async () => {
    // Arrange
    chatRepository.findChatPrivadoByIdUsuarios.mockResolvedValue({ _id: 'chat1' });
    integranteRepository.findOne.mockResolvedValue({ _id: 'int1' });
    integranteRepository.findAll.mockResolvedValue([
      { _id: 'int1', id_usuario: 'userA' },
      { _id: 'int2', id_usuario: 'userB' },
    ]);
    mensajeRepository.create.mockResolvedValue({
      _id: 'msg1',
      createdAt: new Date(),
      estado: Estado.HABILITADO,
    });
    archivosService.saveImagen.mockResolvedValue(
      crearRespuesta({
        success: true,
        data: { id_archivo: 'img1', nombre: 'foto.png', tipoArchivo: TipoArchivo.IMAGEN },
      }),
    );

    const archivos = [
      { tipoArchivo: TipoArchivo.IMAGEN, b64: 'abc123', nombre: 'foto.png' },
    ];

    // Act
    const result = await sendMensajePrivadoCU.execute(usuarioMock, 'userB', 'Con imagen', archivos);

    // Assert
    expect(result.success).toBe(true);
    expect(archivosService.saveImagen).toHaveBeenCalledTimes(1);
    expect(detalleRepository.create).toHaveBeenCalledWith({
      id_mensaje: 'msg1',
      id_archivo: 'img1',
    });
  });
});
