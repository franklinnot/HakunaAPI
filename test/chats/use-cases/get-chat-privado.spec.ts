/* eslint-disable @typescript-eslint/unbound-method */
import { ChatsService } from 'src/modules/chats/application/chats.service';
import { GetChatPrivado } from 'src/modules/chats/application/use-cases/get-chat-privado';
import { IChatPrivadoResponse } from 'src/modules/chats/application/chats.responses';
import { IRespuesta } from 'src/shared/application/response';

describe('ChatsService - getChatPrivado', () => {
  let chatsService: ChatsService;
  let getChatPrivadoCU: jest.Mocked<GetChatPrivado>;

  beforeEach(() => {
    getChatPrivadoCU = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetChatPrivado>;

    chatsService = new ChatsService(
      {} as any, // CrearChatPrivado
      {} as any, // CrearChatGrupal
      getChatPrivadoCU,
      {} as any, // GetChatsPrivados
      {} as any, // GetChatsGrupales
      {} as any, // UpdateChatGrupal
    );
  });

  // ----------------------------------------------------------------
  // TEST 1: Chat privado encontrado exitosamente
  // ----------------------------------------------------------------
  it('debe retornar correctamente un chat privado existente', async () => {
    const id_usuario = 'userA';
    const id_chat = 'chat123';

    const mockChat: IChatPrivadoResponse = {
      id_chat,
      historial_mensajes: [],
      createdAt: new Date(),
      usuarioB: {
        id_usuario: 'userB',
        username: 'maria',
        nombre: 'Maria',
        link_foto: 'foto.png',
        createdAt: new Date(),
      },
      ultimo_mensaje: null,
      is_group: false,
    };

    const mockResponse: IRespuesta<IChatPrivadoResponse> = {
      success: true,
      data: mockChat,
    };

    getChatPrivadoCU.execute.mockResolvedValue(mockResponse);

    const result = await chatsService.getChatPrivado(id_usuario, id_chat);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockChat);
    expect(getChatPrivadoCU.execute).toHaveBeenCalledWith(id_usuario, id_chat);
  });

  // ----------------------------------------------------------------
  // TEST 2: Caso de uso devuelve error controlado
  // ----------------------------------------------------------------
  it('debe retornar error si el caso de uso retorna error', async () => {
    const id_usuario = 'userA';
    const id_chat = 'chat999';

    const mockErrorResponse: IRespuesta<IChatPrivadoResponse> = {
      success: false,
      data: null,
      error: 'El chat no existe.',
    };

    getChatPrivadoCU.execute.mockResolvedValue(mockErrorResponse);

    const result = await chatsService.getChatPrivado(id_usuario, id_chat);

    expect(result.success).toBe(false);
    expect(result.error).toBe('El chat no existe.');
    expect(getChatPrivadoCU.execute).toHaveBeenCalledWith(id_usuario, id_chat);
  });

  // ----------------------------------------------------------------
  // TEST 3: Error inesperado (excepción)
  // ----------------------------------------------------------------
  it('debe propagar errores inesperados del caso de uso', async () => {
    getChatPrivadoCU.execute.mockRejectedValue(new Error('DB error'));

    await expect(
      chatsService.getChatPrivado('userA', 'chatError'),
    ).rejects.toThrow('DB error');

    expect(getChatPrivadoCU.execute).toHaveBeenCalledWith('userA', 'chatError');
  });
});
