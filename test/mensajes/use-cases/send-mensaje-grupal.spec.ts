import { Test, TestingModule } from '@nestjs/testing';
import { SendMensajeGrupal } from '../../../src/modules/mensajes/application/use-cases/send-mensaje-grupal';
import {
  Estado,
  TipoArchivo,
  TipoEvento,
} from '../../../src/shared/domain/enums';
import { EmisorEventos } from '../../../src/socket/emisor-eventos';

describe('SendMensajeGrupal', () => {
  let service: SendMensajeGrupal;
  let chatRepository: any;
  let integranteRepository: any;
  let mensajeRepository: any;
  let viewerRepository: any;
  let detalleRepository: any;
  let archivosService: any;
  let emisorEventos: EmisorEventos;

  const mockUsuario = {
    _id: 'usuario123',
    nombre: 'Test User',
    email: 'test@test.com',
  };

  const mockChatRepository = {
    findById: jest.fn(),
  };

  const mockIntegranteRepository = {
    findOne: jest.fn(),
    findAll: jest.fn(),
  };

  const mockMensajeRepository = {
    create: jest.fn(),
  };

  const mockViewerRepository = {
    registrarViewers: jest.fn(),
  };

  const mockDetalleRepository = {
    create: jest.fn(),
  };

  const mockArchivosService = {
    saveImagen: jest.fn(),
    saveDocumento: jest.fn(),
  };

  const mockEmisorEventos = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendMensajeGrupal,
        {
          provide: 'IChatRepository',
          useValue: mockChatRepository,
        },
        {
          provide: 'IIntegranteRepository',
          useValue: mockIntegranteRepository,
        },
        {
          provide: 'IMensajeRepository',
          useValue: mockMensajeRepository,
        },
        {
          provide: 'IViewerRepository',
          useValue: mockViewerRepository,
        },
        {
          provide: 'IDetalleMensajeRepository',
          useValue: mockDetalleRepository,
        },
        {
          provide: 'IArchivosService',
          useValue: mockArchivosService,
        },
        {
          provide: EmisorEventos,
          useValue: mockEmisorEventos,
        },
      ],
    }).compile();

    service = module.get<SendMensajeGrupal>(SendMensajeGrupal);
    chatRepository = mockChatRepository;
    integranteRepository = mockIntegranteRepository;
    mensajeRepository = mockMensajeRepository;
    viewerRepository = mockViewerRepository;
    detalleRepository = mockDetalleRepository;
    archivosService = mockArchivosService;
    emisorEventos = module.get<EmisorEventos>(EmisorEventos);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - Happy Path', () => {
    it('debe enviar un mensaje grupal solo con texto', async () => {
      const id_chat = 'chat123';
      const descripcion = 'Hola grupo!';

      const mockChat = {
        _id: id_chat,
        is_group: true,
        nombre: 'Grupo Test',
      };

      const mockIntegrante = {
        _id: 'integrante123',
        id_chat: id_chat,
        id_usuario: mockUsuario._id,
        estado: Estado.HABILITADO,
      };

      const mockIntegrantes = [
        mockIntegrante,
        { _id: 'integrante456', id_chat: id_chat, id_usuario: 'usuario456' },
      ];

      const mockMensaje = {
        _id: 'mensaje123',
        id_integrante: mockIntegrante._id,
        descripcion: descripcion,
        has_files: false,
        estado: Estado.HABILITADO,
        createdAt: new Date(),
      };

      mockChatRepository.findById.mockResolvedValue(mockChat);
      mockIntegranteRepository.findOne.mockResolvedValue(mockIntegrante);
      mockMensajeRepository.create.mockResolvedValue(mockMensaje);
      mockIntegranteRepository.findAll.mockResolvedValue(mockIntegrantes);
      mockViewerRepository.registrarViewers.mockResolvedValue([]);

      const result = await service.execute(
        mockUsuario as any,
        id_chat,
        descripcion,
      );

      expect(result.success).toBe(true);
      expect(result.data?.descripcion).toBe(descripcion);
      expect(result.data?.has_files).toBe(false);
      expect(mockMensajeRepository.create).toHaveBeenCalledWith({
        id_integrante: mockIntegrante._id,
        descripcion: descripcion,
        has_files: false,
      });
      expect(mockViewerRepository.registrarViewers).toHaveBeenCalled();
      expect(mockEmisorEventos.emit).toHaveBeenCalledWith(
        TipoEvento.NUEVO_MENSAJE_GRUPAL,
        expect.any(Object),
      );
    });

    it('debe enviar mensaje grupal con archivos de imagen', async () => {
      const id_chat = 'chat123';
      const descripcion = 'Miren esta imagen';
      const archivos = [
        {
          tipoArchivo: TipoArchivo.IMAGEN,
          b64: 'base64image',
          nombre: 'foto.jpg',
        },
      ];

      const mockChat = { _id: id_chat, is_group: true };
      const mockIntegrante = {
        _id: 'integrante123',
        id_chat: id_chat,
        id_usuario: mockUsuario._id,
        estado: Estado.HABILITADO,
      };
      const mockMensaje = {
        _id: 'mensaje123',
        id_integrante: mockIntegrante._id,
        descripcion: descripcion,
        has_files: true,
        estado: Estado.HABILITADO,
        createdAt: new Date(),
      };

      const mockArchivoResponse = {
        id_archivo: 'archivo123',
        nombre: 'foto.jpg',
        tipo_archivo: TipoArchivo.IMAGEN,
        link: 'https://storage.com/image.webp',
      };

      mockChatRepository.findById.mockResolvedValue(mockChat);
      mockIntegranteRepository.findOne.mockResolvedValue(mockIntegrante);
      mockMensajeRepository.create.mockResolvedValue(mockMensaje);
      mockIntegranteRepository.findAll.mockResolvedValue([mockIntegrante]);
      mockViewerRepository.registrarViewers.mockResolvedValue([]);
      mockArchivosService.saveImagen.mockResolvedValue({
        success: true,
        data: mockArchivoResponse,
      });
      mockDetalleRepository.create.mockResolvedValue({});

      const result = await service.execute(
        mockUsuario as any,
        id_chat,
        descripcion,
        archivos,
      );

      expect(result.success).toBe(true);
      expect(result.data?.has_files).toBe(true);
      expect(result.data?.archivos).toHaveLength(1);
      expect(mockArchivosService.saveImagen).toHaveBeenCalledWith(
        'base64image',
        'foto.jpg',
      );
      expect(mockDetalleRepository.create).toHaveBeenCalled();
    });

    it('debe enviar mensaje grupal con archivos de documento', async () => {
      const id_chat = 'chat123';
      const archivos = [
        {
          tipoArchivo: TipoArchivo.DOCUMENTO,
          b64: 'base64pdf',
          nombre: 'documento.pdf',
        },
      ];

      const mockChat = { _id: id_chat, is_group: true };
      const mockIntegrante = {
        _id: 'integrante123',
        id_chat: id_chat,
        id_usuario: mockUsuario._id,
        estado: Estado.HABILITADO,
      };
      const mockMensaje = {
        _id: 'mensaje123',
        id_integrante: mockIntegrante._id,
        has_files: true,
        estado: Estado.HABILITADO,
        createdAt: new Date(),
      };

      const mockArchivoResponse = {
        id_archivo: 'archivo123',
        nombre: 'documento.pdf',
        tipo_archivo: TipoArchivo.DOCUMENTO,
        link: 'https://storage.com/doc.pdf',
      };

      mockChatRepository.findById.mockResolvedValue(mockChat);
      mockIntegranteRepository.findOne.mockResolvedValue(mockIntegrante);
      mockMensajeRepository.create.mockResolvedValue(mockMensaje);
      mockIntegranteRepository.findAll.mockResolvedValue([mockIntegrante]);
      mockViewerRepository.registrarViewers.mockResolvedValue([]);
      mockArchivosService.saveDocumento.mockResolvedValue({
        success: true,
        data: mockArchivoResponse,
      });
      mockDetalleRepository.create.mockResolvedValue({});

      const result = await service.execute(
        mockUsuario as any,
        id_chat,
        undefined,
        archivos,
      );

      expect(result.success).toBe(true);
      expect(mockArchivosService.saveDocumento).toHaveBeenCalled();
    });
  });

  describe('execute - Sad Paths', () => {
    it('debe fallar si no hay descripción ni archivos', async () => {
      const id_chat = 'chat123';

      const result = await service.execute(mockUsuario as any, id_chat);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No se puede enviar un mensaje vacío.');
      expect(mockChatRepository.findById).not.toHaveBeenCalled();
    });

    it('debe fallar si el chat no existe', async () => {
      const id_chat = 'chat-inexistente';
      const descripcion = 'Hola';

      mockChatRepository.findById.mockResolvedValue(null);

      const result = await service.execute(
        mockUsuario as any,
        id_chat,
        descripcion,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('El chat no existe.');
    });

    it('debe fallar si el chat no es grupal', async () => {
      const id_chat = 'chat123';
      const descripcion = 'Hola';

      const mockChat = {
        _id: id_chat,
        is_group: false,
      };

      mockChatRepository.findById.mockResolvedValue(mockChat);

      const result = await service.execute(
        mockUsuario as any,
        id_chat,
        descripcion,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('El chat no es grupal.');
    });

    it('debe fallar si el usuario no es integrante del grupo', async () => {
      const id_chat = 'chat123';
      const descripcion = 'Hola';

      const mockChat = { _id: id_chat, is_group: true };

      mockChatRepository.findById.mockResolvedValue(mockChat);
      mockIntegranteRepository.findOne.mockResolvedValue(null);

      const result = await service.execute(
        mockUsuario as any,
        id_chat,
        descripcion,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'El usuario no es integrante del grupo o no está habilitado.',
      );
    });

    it('debe omitir archivos que fallan al guardarse', async () => {
      const id_chat = 'chat123';
      const archivos = [
        {
          tipoArchivo: TipoArchivo.IMAGEN,
          b64: 'base64image',
          nombre: 'foto.jpg',
        },
      ];

      const mockChat = { _id: id_chat, is_group: true };
      const mockIntegrante = {
        _id: 'integrante123',
        id_chat: id_chat,
        id_usuario: mockUsuario._id,
        estado: Estado.HABILITADO,
      };
      const mockMensaje = {
        _id: 'mensaje123',
        id_integrante: mockIntegrante._id,
        has_files: true,
        estado: Estado.HABILITADO,
        createdAt: new Date(),
      };

      mockChatRepository.findById.mockResolvedValue(mockChat);
      mockIntegranteRepository.findOne.mockResolvedValue(mockIntegrante);
      mockMensajeRepository.create.mockResolvedValue(mockMensaje);
      mockIntegranteRepository.findAll.mockResolvedValue([mockIntegrante]);
      mockViewerRepository.registrarViewers.mockResolvedValue([]);
      mockArchivosService.saveImagen.mockResolvedValue({
        success: false,
        error: 'Error al guardar',
      });

      const result = await service.execute(
        mockUsuario as any,
        id_chat,
        undefined,
        archivos,
      );

      expect(result.success).toBe(true);
      expect(result.data?.archivos).toHaveLength(0);
    });
  });

  describe('execute - Edge Cases', () => {
    it('debe marcar como visto solo para el emisor', async () => {
      const id_chat = 'chat123';
      const descripcion = 'Hola';

      const mockChat = { _id: id_chat, is_group: true };
      const mockIntegrante = {
        _id: 'integrante123',
        id_chat: id_chat,
        id_usuario: mockUsuario._id,
        estado: Estado.HABILITADO,
      };
      const mockIntegrantes = [
        mockIntegrante,
        { _id: 'integrante456', id_chat: id_chat, id_usuario: 'usuario456' },
        { _id: 'integrante789', id_chat: id_chat, id_usuario: 'usuario789' },
      ];
      const mockMensaje = {
        _id: 'mensaje123',
        id_integrante: mockIntegrante._id,
        descripcion: descripcion,
        has_files: false,
        estado: Estado.HABILITADO,
        createdAt: new Date(),
      };

      mockChatRepository.findById.mockResolvedValue(mockChat);
      mockIntegranteRepository.findOne.mockResolvedValue(mockIntegrante);
      mockMensajeRepository.create.mockResolvedValue(mockMensaje);
      mockIntegranteRepository.findAll.mockResolvedValue(mockIntegrantes);
      mockViewerRepository.registrarViewers.mockResolvedValue([]);

      await service.execute(mockUsuario as any, id_chat, descripcion);

      expect(mockViewerRepository.registrarViewers).toHaveBeenCalledWith(
        'mensaje123',
        expect.arrayContaining([
          expect.objectContaining({
            id_integrante: 'integrante123',
            visto: true,
          }),
          expect.objectContaining({
            id_integrante: 'integrante456',
            visto: false,
          }),
          expect.objectContaining({
            id_integrante: 'integrante789',
            visto: false,
          }),
        ]),
      );
    });

    it('debe omitir archivos de tipo no implementado', async () => {
      const id_chat = 'chat123';
      const archivos = [
        {
          tipoArchivo: TipoArchivo.AUDIO,
          b64: 'base64audio',
          nombre: 'audio.mp3',
        },
      ];

      const mockChat = { _id: id_chat, is_group: true };
      const mockIntegrante = {
        _id: 'integrante123',
        id_chat: id_chat,
        id_usuario: mockUsuario._id,
        estado: Estado.HABILITADO,
      };
      const mockMensaje = {
        _id: 'mensaje123',
        id_integrante: mockIntegrante._id,
        has_files: true,
        estado: Estado.HABILITADO,
        createdAt: new Date(),
      };

      mockChatRepository.findById.mockResolvedValue(mockChat);
      mockIntegranteRepository.findOne.mockResolvedValue(mockIntegrante);
      mockMensajeRepository.create.mockResolvedValue(mockMensaje);
      mockIntegranteRepository.findAll.mockResolvedValue([mockIntegrante]);
      mockViewerRepository.registrarViewers.mockResolvedValue([]);

      const result = await service.execute(
        mockUsuario as any,
        id_chat,
        undefined,
        archivos,
      );

      expect(result.success).toBe(true);
      expect(result.data?.archivos).toHaveLength(0);
      expect(mockArchivosService.saveImagen).not.toHaveBeenCalled();
      expect(mockArchivosService.saveDocumento).not.toHaveBeenCalled();
    });
  });
});
