import { ChatsService } from 'src/modules/chats/application/chats.service';
import { UpdateChatGrupal } from 'src/modules/chats/application/use-cases/update-chat-grupal/update-chat-grupal';
import { IChatGrupalResponse } from 'src/modules/chats/application/chats.responses';
import { IRespuesta } from 'src/shared/application/response';

describe('ChatsService - updateChatGrupal', () => {
  let chatsService: ChatsService;
  let updateChatGrupalCU: jest.Mocked<UpdateChatGrupal>;

  beforeEach(() => {
    updateChatGrupalCU = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateChatGrupal>;

    chatsService = new ChatsService(
      {} as any, // CrearChatPrivado
      {} as any, // CrearChatGrupal
      {} as any, // GetChatPrivado
      {} as any, // GetChatsPrivados
      {} as any, // GetChatsGrupales
      updateChatGrupalCU, // ✅ usamos el mock del caso de uso
    );
  });

  // ----------------------------------------------------------------
  // TEST 1: Actualización exitosa
  // ----------------------------------------------------------------
  it('debe retornar correctamente cuando el caso de uso actualiza el chat grupal', async () => {
    const id_usuario = 'user123';
    const id_chat = 'chatABC';

    const mockChat: IChatGrupalResponse = {
      id_chat,
      link_foto: 'link.png',
      nombre: 'Nuevo grupo',
      descripcion: 'Grupo actualizado',
      integrantes: [],
      cantidad_integrantes: 5,
      historial_mensajes: [],
      createdAt: new Date(),
      ultimo_mensaje: null,
      is_group: true
    };

    const mockResponse: IRespuesta<IChatGrupalResponse> = {
      success: true,
      data: mockChat,
    };

    updateChatGrupalCU.execute.mockResolvedValue(mockResponse);

    const result = await chatsService.updateChatGrupal(
      id_usuario,
      id_chat,
      'Nuevo grupo',
      'Grupo actualizado',
      'foto.png',
    );

    expect(result).toEqual(mockResponse);
    expect(updateChatGrupalCU.execute).toHaveBeenCalledWith(
      id_usuario,
      id_chat,
      'Nuevo grupo',
      'Grupo actualizado',
      'foto.png',
    );
  });

  // ----------------------------------------------------------------
  // TEST 2: Caso de uso devuelve error controlado
  // ----------------------------------------------------------------
  it('debe retornar error si el caso de uso falla', async () => {
    const id_usuario = 'userX';
    const id_chat = 'chatXYZ';

    const mockError: IRespuesta<IChatGrupalResponse> = {
      success: false,
      data: null,
      error: 'Chat grupal no encontrado',
    };

    updateChatGrupalCU.execute.mockResolvedValue(mockError);

    const result = await chatsService.updateChatGrupal(id_usuario, id_chat);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Chat grupal no encontrado');
    expect(updateChatGrupalCU.execute).toHaveBeenCalledWith(
      id_usuario,
      id_chat,
      undefined,
      undefined,
      undefined,
    );
  });

  // ----------------------------------------------------------------
  // TEST 3: Caso de uso lanza una excepción inesperada
  // ----------------------------------------------------------------
  it('debe propagar el error si el caso de uso lanza una excepción', async () => {
    updateChatGrupalCU.execute.mockRejectedValue(
      new Error('Error interno del servidor'),
    );

    await expect(
      chatsService.updateChatGrupal('userY', 'chatError'),
    ).rejects.toThrow('Error interno del servidor');

    expect(updateChatGrupalCU.execute).toHaveBeenCalledWith(
      'userY',
      'chatError',
      undefined,
      undefined,
      undefined,
    );
  });
});
