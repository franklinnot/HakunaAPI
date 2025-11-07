/* eslint-disable @typescript-eslint/unbound-method */
import { ChatsService } from 'src/modules/chats/application/chats.service';
import { GetChatsGrupales } from 'src/modules/chats/application/use-cases/get-chats-grupales';
import { IChatGrupalResponse } from 'src/modules/chats/application/chats.responses';
import { IRespuesta } from 'src/shared/application/response';

describe('ChatsService - getChatsGrupales', () => {
  let chatsService: ChatsService;
  let getChatsGrupalesCU: jest.Mocked<GetChatsGrupales>;

  beforeEach(() => {
    // Creamos mocks de todos los casos de uso inyectados (solo necesitamos el relevante)
    getChatsGrupalesCU = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetChatsGrupales>;

    // Instanciamos el servicio principal con los mocks
    chatsService = new ChatsService(
      {} as any, // CrearChatPrivado
      {} as any, // CrearChatGrupal
      {} as any, // GetChatPrivado
      {} as any, // GetChatsPrivados
      getChatsGrupalesCU,
      {} as any, // UpdateChatGrupal
    );
  });

  // ----------------------------------------------------------------
  // TEST 1: Retorna lista de chats grupales exitosamente
  // ----------------------------------------------------------------
  it('debe retornar los chats grupales correctamente', async () => {
    const id_usuario = 'u123';
    const mockChats: IChatGrupalResponse[] = [
      {
        id_chat: 'chat1',
        nombre: 'Grupo Devs',
        descripcion: 'Grupo para desarrolladores',
        createdAt: new Date(),
        link_foto: 'foto1.png',
        integrantes: [],
        cantidad_integrantes: 5,
        is_group: true,
        historial_mensajes: [],
        ultimo_mensaje: null,
      },
    ];

    const mockResponse: IRespuesta<IChatGrupalResponse[]> = {
      success: true,
      data: mockChats,
    };

    getChatsGrupalesCU.execute.mockResolvedValue(mockResponse);

    const result = await chatsService.getChatsGrupales(id_usuario);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockChats);
    expect(getChatsGrupalesCU.execute).toHaveBeenCalledWith(id_usuario);
  });

  // ----------------------------------------------------------------
  // TEST 2: Retorna error si el caso de uso falla (success: false)
  // ----------------------------------------------------------------
  it('debe retornar error si getChatsGrupalesCU retorna error', async () => {
    const id_usuario = 'u999';

    getChatsGrupalesCU.execute.mockResolvedValue({
      success: false,
      data:null,
      error: 'Usuario no tiene chats grupales',
    });

    const result = await chatsService.getChatsGrupales(id_usuario);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Usuario no tiene chats grupales');
    expect(getChatsGrupalesCU.execute).toHaveBeenCalledWith(id_usuario);
  });

  // ----------------------------------------------------------------
  // TEST 3: Maneja excepciones inesperadas (por ejemplo, error interno)
  // ----------------------------------------------------------------
  it('debe lanzar una excepción si ocurre un error inesperado', async () => {
    const id_usuario = 'u500';
    getChatsGrupalesCU.execute.mockRejectedValue(
      new Error('Error de base de datos'),
    );

    await expect(chatsService.getChatsGrupales(id_usuario)).rejects.toThrow(
      'Error de base de datos',
    );
  });
});
    