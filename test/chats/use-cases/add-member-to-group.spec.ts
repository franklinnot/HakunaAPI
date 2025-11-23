import { AddMemberToGroup } from 'src/modules/chats/application/use-cases/add-member-to-group';
import { crearRespuesta } from 'src/shared/application/response';
import { Estado, TipoEvento } from 'src/shared/domain/enums';
import { ChatsMapper } from 'src/modules/chats/application/chats.mapper';

jest.mock('src/shared/application/response');
jest.mock('src/modules/chats/application/chats.mapper');

describe('AddMemberToGroup', () => {
  let service: AddMemberToGroup;
  let chatRepository: any;
  let integranteRepository: any;
  let chatsUtils: any;
  let usuariosUtils: any;
  let mensajesUtils: any;
  let getMensajesGrupalesCU: any;
  let emisorEventos: any;

  beforeEach(() => {
    chatRepository = { findById: jest.fn() };
    integranteRepository = { findOne: jest.fn(), create: jest.fn() };
    chatsUtils = {
      sincronizarCantidadIntegrantes: jest.fn(),
      getIntegrantesResponseByChat: jest.fn(),
    };
    usuariosUtils = { getUsuarioResponseById: jest.fn() };
    mensajesUtils = { getUltimoMensaje: jest.fn() };
    getMensajesGrupalesCU = { execute: jest.fn() };
    emisorEventos = { emit: jest.fn() };

    service = new AddMemberToGroup(
      chatRepository,
      integranteRepository,
      chatsUtils,
      usuariosUtils,
      mensajesUtils,
      getMensajesGrupalesCU,
      emisorEventos,
    );

    (crearRespuesta as jest.Mock).mockImplementation((obj) => obj);
    (ChatsMapper.toChatGrupalResponse as jest.Mock).mockImplementation(
      (chat, integrantes, mensajes, ultimo) => ({
        ...chat,
        integrantes,
        mensajes,
        ultimo,
      }),
    );
  });

  // 1️⃣ Flujo correcto
  it('debe agregar un nuevo miembro correctamente', async () => {
    const id_chat = 'chat123';
    const id_usuario = 'admin123';
    const id_nuevo_miembro = 'user456';

    chatRepository.findById.mockResolvedValue({ id_chat, id_foto: 'foto123' });
    integranteRepository.findOne
      .mockResolvedValueOnce({ id_usuario, estado: Estado.HABILITADO }) // usuario solicitante
      .mockResolvedValueOnce(null); // nuevo miembro no existente
    usuariosUtils.getUsuarioResponseById.mockResolvedValue({
      id_usuario: id_nuevo_miembro,
      nombre: 'Nuevo',
    });
    chatsUtils.getIntegrantesResponseByChat.mockResolvedValue([
      { id_usuario },
      { id_usuario: id_nuevo_miembro },
    ]);
    getMensajesGrupalesCU.execute.mockResolvedValue({
      success: true,
      data: [],
    });
    mensajesUtils.getUltimoMensaje.mockResolvedValue({ texto: 'Hola!' });

    const result = await service.execute(id_usuario, id_chat, id_nuevo_miembro);

    expect(chatRepository.findById).toHaveBeenCalledTimes(2); // se consulta dos veces
    expect(integranteRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_chat,
        id_usuario: id_nuevo_miembro,
        estado: Estado.HABILITADO,
      }),
    );
    expect(chatsUtils.sincronizarCantidadIntegrantes).toHaveBeenCalledWith(
      id_chat,
    );
    expect(emisorEventos.emit).toHaveBeenCalledWith(
      TipoEvento.NUEVO_INTEGRANTE,
      expect.objectContaining({
        id_chat,
        nuevo_miembro: { id_usuario: id_nuevo_miembro, nombre: 'Nuevo' },
      }),
    );
    expect(result.success).toBe(true);
    expect(result.data.integrantes.length).toBe(2);
  });

  // 2️⃣ Chat no existe
  it('debe retornar error si el chat no existe', async () => {
    chatRepository.findById.mockResolvedValue(null);

    const result = await service.execute('u1', 'chatX', 'u2');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Chat no encontrado');
    expect(integranteRepository.findOne).not.toHaveBeenCalled();
  });

  // 3️⃣ Usuario solicitante no es miembro
  it('debe retornar error si el usuario no es miembro del grupo', async () => {
    chatRepository.findById.mockResolvedValue({ id_chat: 'chatX' });
    integranteRepository.findOne.mockResolvedValue(null);

    const result = await service.execute('u1', 'chatX', 'u2');

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      'No tienes permisos para agregar miembros a este grupo',
    );
  });

  // 4️⃣ Nuevo miembro no existe
  it('debe retornar error si el usuario a agregar no existe', async () => {
    chatRepository.findById.mockResolvedValue({ id_chat: 'chatX' });
    integranteRepository.findOne
      .mockResolvedValueOnce({ id_usuario: 'u1', estado: Estado.HABILITADO })
      .mockResolvedValueOnce(null);
    usuariosUtils.getUsuarioResponseById.mockResolvedValue(null);

    const result = await service.execute('u1', 'chatX', 'u2');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Usuario no encontrado');
  });

  // 5️⃣ Miembro ya existente
  it('debe retornar error si el usuario ya es miembro del grupo', async () => {
    chatRepository.findById.mockResolvedValue({ id_chat: 'chatX' });
    integranteRepository.findOne
      .mockResolvedValueOnce({ id_usuario: 'u1', estado: Estado.HABILITADO })
      .mockResolvedValueOnce({ id_usuario: 'u2', estado: Estado.HABILITADO });
    usuariosUtils.getUsuarioResponseById.mockResolvedValue({
      id_usuario: 'u2',
    });

    const result = await service.execute('u1', 'chatX', 'u2');

    expect(result.success).toBe(false);
    expect(result.error).toBe('El usuario ya es miembro del grupo');
  });

  // 6️⃣ Error inesperado
  it('debe retornar error si ocurre una excepción interna', async () => {
    chatRepository.findById.mockRejectedValue(new Error('falló'));

    const result = await service.execute('u1', 'chatX', 'u2');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Error interno del servidor');
  });
});
