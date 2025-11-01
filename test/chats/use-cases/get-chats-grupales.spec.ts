/* eslint-disable @typescript-eslint/unbound-method */
import { GetChatsGrupales } from 'src/modules/chats/application/use-cases/get-chats-grupales';
import { GetChatGrupal } from 'src/modules/chats/application/use-cases/get-chat-grupal';
import { IChatRepository } from 'src/modules/chats/infraestructure/chats.repositories.interfaces';
import { IChat } from 'src/modules/chats/domain/chats.entities';
import { IChatGrupalResponse } from 'src/modules/chats/application/chats.responses';
import { crearRespuesta, IRespuesta } from 'src/shared/application/response';

describe('GetChatsGrupales', () => {
  let getChatsGrupales: GetChatsGrupales;
  let chatRepository: jest.Mocked<IChatRepository>;
  let getChatGrupalCU: jest.Mocked<GetChatGrupal>;

  beforeEach(() => {
    chatRepository = {
      findChatsGrupalesByIdUsuario: jest.fn(),
    } as unknown as jest.Mocked<IChatRepository>;

    getChatGrupalCU = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetChatGrupal>;

    getChatsGrupales = new GetChatsGrupales(chatRepository, getChatGrupalCU);
  });

  it('debe retornar una lista de chats grupales ordenados por fecha del último mensaje', async () => {
    const id_usuario = 'user123';
    const chats = [{ _id: 'chat1' }, { _id: 'chat2' }];

    chatRepository.findChatsGrupalesByIdUsuario.mockResolvedValue(
      chats as IChat[],
    );

    const chatResponses: IChatGrupalResponse[] = [
      {
        id_chat: 'chat1',
        nombre: 'Grupo 1',
        ultimo_mensaje: { createdAt: new Date('2024-01-01') },
      } as IChatGrupalResponse,
      {
        id_chat: 'chat2',
        nombre: 'Grupo 2',
        ultimo_mensaje: { createdAt: new Date('2024-01-05') },
      } as IChatGrupalResponse,
    ];

    getChatGrupalCU.execute
      .mockResolvedValueOnce(
        crearRespuesta({
          success: true,
          data: chatResponses[0],
        }),
      )
      .mockResolvedValueOnce(
        crearRespuesta({
          success: true,
          data: chatResponses[1],
        }),
      );

    const result = await getChatsGrupales.execute(id_usuario);

    expect(chatRepository.findChatsGrupalesByIdUsuario).toHaveBeenCalledWith(
      id_usuario,
    );
    expect(getChatGrupalCU.execute).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    // Debe estar ordenado: el más reciente primero
    expect(result.data?.[0].id_chat).toBe('chat2');
  });

  it('debe retornar una lista vacía si no hay chats grupales', async () => {
    chatRepository.findChatsGrupalesByIdUsuario.mockResolvedValue([]);

    const result = await getChatsGrupales.execute('user123');

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
    expect(getChatGrupalCU.execute).not.toHaveBeenCalled();
  });

  it('debe ignorar los chats grupales cuyo caso de uso GetChatGrupal falle', async () => {
    chatRepository.findChatsGrupalesByIdUsuario.mockResolvedValue([
      { _id: 'chat1' },
      { _id: 'chat2' },
    ] as IChat[]);

    getChatGrupalCU.execute
      .mockResolvedValueOnce(crearRespuesta({ success: false }))
      .mockResolvedValueOnce(
        crearRespuesta({
          success: true,
          data: { id_chat: 'chat2', nombre: 'Grupo válido' },
        }) as IRespuesta<IChatGrupalResponse>,
      );

    const result = await getChatsGrupales.execute('user123');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0].id_chat).toBe('chat2');
  });
});
