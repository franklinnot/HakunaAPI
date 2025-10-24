/* eslint-disable @typescript-eslint/unbound-method */
import { GetChatsPrivados } from 'src/modules/chats/application/use-cases/get-chats-privados';
import { crearRespuesta, IRespuesta } from 'src/shared/application/response';
import { GetChatPrivado } from 'src/modules/chats/application/use-cases/get-chat-privado';
import { IChatRepository } from 'src/modules/chats/infraestructure/chats.repositories.interfaces';
import { IChat } from 'src/modules/chats/domain/chats.entities';
import { IChatPrivadoResponse } from 'src/modules/chats/application/chats.responses';

describe('GetChatsPrivados', () => {
  let getChatsPrivados: GetChatsPrivados;

  let chatRepository: jest.Mocked<IChatRepository>;
  let getChatPrivadoCU: jest.Mocked<GetChatPrivado>;

  beforeEach(() => {
    chatRepository = {
      findChatsPrivadosByIdUsuario: jest.fn(),
    } as unknown as jest.Mocked<IChatRepository>;

    getChatPrivadoCU = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetChatPrivado>;

    getChatsPrivados = new GetChatsPrivados(chatRepository, getChatPrivadoCU);
  });

  it('debe retornar una lista de chats privados ordenados por fecha del último mensaje', async () => {
    const id_usuario = 'user1';
    const chats = [{ _id: 'chat1' }, { _id: 'chat2' }];

    chatRepository.findChatsPrivadosByIdUsuario.mockResolvedValue(
      chats as IChat[],
    );

    const chatResponses = [
      {
        id_chat: 'chat1',
        ultimo_mensaje: { createdAt: new Date('2024-01-02') },
      },
      {
        id_chat: 'chat2',
        ultimo_mensaje: { createdAt: new Date('2024-01-03') },
      },
    ];

    getChatPrivadoCU.execute
      .mockResolvedValueOnce(
        crearRespuesta({
          success: true,
          data: chatResponses[0],
        }) as IRespuesta<IChatPrivadoResponse>,
      )
      .mockResolvedValueOnce(
        crearRespuesta({
          success: true,
          data: chatResponses[1],
        }) as IRespuesta<IChatPrivadoResponse>,
      );

    const result = await getChatsPrivados.execute(id_usuario);

    expect(chatRepository.findChatsPrivadosByIdUsuario).toHaveBeenCalledWith(
      id_usuario,
    );
    expect(getChatPrivadoCU.execute).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data?.[0].id_chat).toBe('chat2'); // más reciente primero
  });

  it('debe retornar una lista vacía si no hay chats', async () => {
    chatRepository.findChatsPrivadosByIdUsuario.mockResolvedValue([]);
    const result = await getChatsPrivados.execute('user1');

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
    expect(getChatPrivadoCU.execute).not.toHaveBeenCalled();
  });

  it('debe ignorar los chats cuyo caso de uso GetChatPrivado falle', async () => {
    chatRepository.findChatsPrivadosByIdUsuario.mockResolvedValue([
      { _id: 'chat1' },
      { _id: 'chat2' },
    ] as IChat[]);

    getChatPrivadoCU.execute
      .mockResolvedValueOnce(crearRespuesta({ success: false }))
      .mockResolvedValueOnce(
        crearRespuesta({
          success: true,
          data: { id_chat: 'chat2' },
        }) as IRespuesta<IChatPrivadoResponse>,
      );

    const result = await getChatsPrivados.execute('user1');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0].id_chat).toBe('chat2');
  });
});
