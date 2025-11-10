import { ChatsController } from 'src/modules/chats/presentation/chats.controller';
import { CreateChatGrupalDto, UpdateChatGrupalDto } from 'src/modules/chats/presentation/chats.dtos';
import { IChatsService } from 'src/modules/chats/application/chats.service.interface';
import { IRespuesta } from 'src/shared/application/response';
import { IChatGrupalResponse, IChatPrivadoResponse } from 'src/modules/chats/application/chats.responses';

describe('ChatsController', () => {
  let controller: ChatsController;
  let chatsService: jest.Mocked<IChatsService>;

  const mockUser = { _id: 'u123', nombre: 'Juan' };
  const mockRequest = { user: { data: mockUser } };

  beforeEach(() => {
    chatsService = {
      crearChatPrivado: jest.fn(),
      crearChatGrupal: jest.fn(),
      getChatsPrivados: jest.fn(),
      getChatsGrupales: jest.fn(),
      getChatPrivado: jest.fn(),
      updateChatGrupal: jest.fn(),
    };

    controller = new ChatsController(chatsService);
  });

 it('POST /chats/grupal → debe llamar a crearChatGrupal con los parámetros correctos', async () => {
  const dto: CreateChatGrupalDto = {
    integrantes: [{ id_usuario: 'u2' }] as any,
    nombre: 'Equipo QA',
    descripcion: 'Grupo de pruebas',
    foto: 'fotoBase64',
  };

  const expectedResponse: IRespuesta<IChatGrupalResponse> = {
    success: true,
    data: {
        nombre: 'Equipo QA',
        descripcion: 'Grupo de pruebas',
        link_foto: 'fotoBase64',
        integrantes: [{ id_usuario: 'u2' }] as any,
        cantidad_integrantes: 2,
        id_chat: '',
        historial_mensajes: [],
        ultimo_mensaje: null,
        is_group: false,
        createdAt: new Date()
    },
  };

  chatsService.crearChatGrupal.mockResolvedValue(expectedResponse);

  const result = await controller.crearChatGrupal(mockRequest as any, dto);

  expect(chatsService.crearChatGrupal).toHaveBeenCalledWith(
    mockUser,
    dto.integrantes,
    dto.nombre,
    dto.descripcion,
    dto.foto,
  );
  expect(result).toBe(expectedResponse);
});


  // -------------------------------------------------------------------
  it('GET /chats/privados → debe obtener los chats privados del usuario', async () => {
    const expected = { success: true, data: [] };
    chatsService.getChatsPrivados.mockResolvedValue(expected);

    const result = await controller.getChatsPrivados(mockRequest as any);

    expect(chatsService.getChatsPrivados).toHaveBeenCalledWith('u123');
    expect(result).toBe(expected);
  });

  // -------------------------------------------------------------------
  it('GET /chats/grupales → debe obtener los chats grupales del usuario', async () => {
    const expected = { success: true, data: [] };
    chatsService.getChatsGrupales.mockResolvedValue(expected);

    const result = await controller.getChatsGrupales(mockRequest as any);

    expect(chatsService.getChatsGrupales).toHaveBeenCalledWith('u123');
    expect(result).toBe(expected);
  });

   // -------------------------------------------------------------------
  it('GET /chats/privado/:id_chat → debe obtener un chat privado por id', async () => {
    const expected: IRespuesta<IChatPrivadoResponse> = {
      success: true,
      data: {
        id_chat: 'chat1',
        historial_mensajes: [],
        createdAt: new Date(),
        ultimo_mensaje: null,
        is_group: false,
        usuarioB: {
            id_usuario: 'u456',
            nombre: 'María',
            link_foto: null,
            username: '',
            createdAt: new Date(),
        },
      },
    };

    chatsService.getChatPrivado.mockResolvedValue(expected);

    const result = await controller.getChatPrivado(mockRequest as any, 'chat1');

    expect(chatsService.getChatPrivado).toHaveBeenCalledWith('u123', 'chat1');
    expect(result).toBe(expected);
  });

  // -------------------------------------------------------------------
  it('PUT /chats/grupal/:id_chat → debe actualizar un chat grupal', async () => {
    const dto: UpdateChatGrupalDto = {
      nombre: 'Nuevo Nombre',
      descripcion: 'Actualizado',
      foto: null,
    };

    const expected: IRespuesta<IChatGrupalResponse> = {
      success: true,
      data: {
        id_chat: 'chat1',
        historial_mensajes: [],
        createdAt: new Date(),
        ultimo_mensaje: null,
        is_group: true,
        link_foto: null,
        nombre: 'Nuevo Nombre',
        descripcion: 'Actualizado',
        integrantes: [],
        cantidad_integrantes: 3,
      },
    };

    chatsService.updateChatGrupal.mockResolvedValue(expected);

    const result = await controller.updateChatGrupal(
      mockRequest as any,
      'chat1',
      dto,
    );

    expect(chatsService.updateChatGrupal).toHaveBeenCalledWith(
      'u123',
      'chat1',
      dto.nombre,
      dto.descripcion,
      dto.foto,
    );
    expect(result).toBe(expected);
  });
});
