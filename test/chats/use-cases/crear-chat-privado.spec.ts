/* eslint-disable @typescript-eslint/unbound-method */
import { CrearChatPrivado } from 'src/modules/chats/application/use-cases/crear-chat-privado';
import { UsuariosUtils } from 'src/modules/usuarios/application/usuarios.utils';
import { Estado } from 'src/shared/domain/enums';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import type {
  IChatRepository,
  IIntegranteRepository,
} from 'src/modules/chats/infraestructure/chats.repositories.interfaces';
import type { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import type { IChat } from 'src/modules/chats/domain/chats.entities';

describe('CrearChatPrivado', () => {
  let crearChatPrivado: CrearChatPrivado;
  let usuarioRepository: jest.Mocked<IUsuarioRepository>;
  let chatRepository: jest.Mocked<IChatRepository>;
  let integranteRepository: jest.Mocked<IIntegranteRepository>;
  let usuariosUtils: jest.Mocked<UsuariosUtils>;

  const mockUsuarioA: IUsuario = {
    _id: 'userA',
    nombre: 'Alice',
    username: 'alice',
    estado: Estado.HABILITADO,
  } as IUsuario;

  const mockUsuarioB: IUsuario = {
    _id: 'userB',
    nombre: 'Bob',
    username: 'bob',
    estado: Estado.HABILITADO,
  } as IUsuario;

  beforeEach(() => {
    usuarioRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IUsuarioRepository>;

    chatRepository = {
      findChatPrivadoByIdUsuarios: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<IChatRepository>;

    integranteRepository = {
      registerIntegrantes: jest.fn(),
    } as unknown as jest.Mocked<IIntegranteRepository>;

    usuariosUtils = {
      getUsuarioResponse: jest.fn(),
    } as unknown as jest.Mocked<UsuariosUtils>;

    crearChatPrivado = new CrearChatPrivado(
      usuarioRepository,
      chatRepository,
      integranteRepository,
      usuariosUtils,
    );
  });

  // ---------------------------------------------------
  // TEST 1: Chat consigo mismo
  // ---------------------------------------------------
  it('debería retornar error si intenta crear un chat consigo mismo', async () => {
    const result = await crearChatPrivado.execute(mockUsuarioA, 'userA');

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      'No se puede crear un chat privado con el mismo usuario.',
    );
    expect(usuarioRepository.findById).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------
  // TEST 2: Usuario B no existe o está deshabilitado
  // ---------------------------------------------------
  it('debería retornar error si el usuario B no existe', async () => {
    usuarioRepository.findById.mockResolvedValue(null);

    const result = await crearChatPrivado.execute(mockUsuarioA, 'userB');

    expect(result.success).toBe(false);
    expect(result.error).toBe('El usuario no existe.');
  });

  it('debería retornar error si el usuario B está deshabilitado', async () => {
    usuarioRepository.findById.mockResolvedValue({
      ...mockUsuarioB,
      estado: Estado.DESHABILITADO,
    });

    const result = await crearChatPrivado.execute(mockUsuarioA, 'userB');

    expect(result.success).toBe(false);
    expect(result.error).toBe('El usuario no existe.');
  });

  // ---------------------------------------------------
  // TEST 3: Ya existe un chat privado
  // ---------------------------------------------------
  it('debería retornar error si ya existe un chat entre ambos usuarios', async () => {
    usuarioRepository.findById.mockResolvedValue(mockUsuarioB);
    chatRepository.findChatPrivadoByIdUsuarios.mockResolvedValue({
      _id: 'chat123',
    } as IChat);

    const result = await crearChatPrivado.execute(mockUsuarioA, 'userB');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Ya existe un chat privado con este usuario.');
  });

  // ---------------------------------------------------
  // TEST 4: Creación exitosa
  // ---------------------------------------------------
  it('debería crear un chat privado exitosamente', async () => {
    usuarioRepository.findById.mockResolvedValue(mockUsuarioB);
    chatRepository.findChatPrivadoByIdUsuarios.mockResolvedValue(null);

    const mockChat: IChat = {
      _id: 'chat123',
      is_group: false,
      cantidad_integrantes: 2,
      createdAt: new Date(),
    } as IChat;

    chatRepository.create.mockResolvedValue(mockChat);

    usuariosUtils.getUsuarioResponse.mockResolvedValue({
      id_usuario: mockUsuarioB._id,
      nombre: mockUsuarioB.nombre,
      username: mockUsuarioB.username,
      link_foto: 'link.png',
      createdAt: new Date(),
    });

    integranteRepository.registerIntegrantes.mockResolvedValue([]);

    const result = await crearChatPrivado.execute(mockUsuarioA, 'userB');

    expect(chatRepository.create).toHaveBeenCalledWith({
      is_group: false,
      cantidad_integrantes: 2,
    });

    expect(integranteRepository.registerIntegrantes).toHaveBeenCalledWith(
      'chat123',
      [
        { id_usuario: 'userA', is_admin: false },
        { id_usuario: 'userB', is_admin: false },
      ],
    );

    expect(result.success).toBe(true);
    expect(result.data?.id_chat).toBe('chat123');
    expect(result.data?.usuarioB).toEqual({
      id_usuario: 'userB',
      nombre: 'Bob',
      username: 'bob',
      link_foto: 'link.png',
      createdAt: expect.any(Date) as Date,
    });
  });

  // ---------------------------------------------------
  // TEST 5: Error inesperado (mock lanza excepción)
  // ---------------------------------------------------
  it('debería lanzar error si ocurre una excepción inesperada', async () => {
    usuarioRepository.findById.mockRejectedValue(new Error('DB Error'));

    await expect(
      crearChatPrivado.execute(mockUsuarioA, 'userB'),
    ).rejects.toThrow('DB Error');
  });
});
