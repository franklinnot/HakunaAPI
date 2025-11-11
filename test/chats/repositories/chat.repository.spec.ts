import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatRepository } from '../../../src/modules/chats/infraestructure/repositories/chat.repository';
import { Chat } from '../../../src/modules/chats/infraestructure/schemas/chat.schema'; // Ajusta la ruta
import { Estado } from 'src/shared/domain/enums'; // Ajusta la ruta

// Mock de la clase Model de Mongoose para simular los métodos
const mockChatModel = () => ({
  aggregate: jest.fn(),
  find: jest.fn(),
  exec: jest.fn(), // Necesario para encadenamiento como .exec()
  // Otros métodos de BaseRepository (si fueran necesarios: create, findOne, etc.)
  // Ya que BaseRepository tiene sus propios tests, nos enfocamos en los métodos custom.
});

describe('ChatRepository', () => {
  let repository: ChatRepository;
  let chatModel: Model<Chat>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatRepository,
        {
          provide: getModelToken(Chat.name),
          useValue: mockChatModel(),
        },
      ],
    }).compile();

    repository = module.get<ChatRepository>(ChatRepository);
    chatModel = module.get<Model<Chat>>(getModelToken(Chat.name));
  });

  it('debe devolver un chat privado al encontrarlo entre dos usuarios', async () => {
    const usuarioA = 'userA-id';
    const usuarioB = 'userB-id';
    const mockChatDoc = {
      // Documento que Mongoose (aggregate) devolvería
      _id: 'chat-id-123',
      is_group: false,
      nombre: 'Chat Privado',
      descripcion: '...',
      estado: Estado.HABILITADO,
      createdAt: new Date(),
      updatedAt: new Date(),
      id_foto: null,
      cantidad_integrantes: 2,
    };

    // Mock del método 'aggregate' para simular la cadena: aggregate().exec()
    (chatModel.aggregate as jest.Mock).mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue([mockChatDoc]),
    }));

    const result = await repository.findChatPrivadoByIdUsuarios(
      usuarioA,
      usuarioB,
    );

    // 1. Verificar que se llamó a aggregate con los parámetros correctos
    expect(chatModel.aggregate).toHaveBeenCalled();
    const aggregateCall = (chatModel.aggregate as jest.Mock).mock.calls[0][0];
    expect(aggregateCall).toHaveLength(4);
    expect(aggregateCall[2].$match['integrantes.id_usuario'].$all).toEqual(
      expect.arrayContaining([usuarioA, usuarioB]),
    );

    // 2. Verificar el resultado y que se aplicó la transformación a dominio
    expect(result).not.toBeNull();
    expect(result!._id).toBe(mockChatDoc._id);
    expect(result!.is_group).toBe(false);
  });

  it('debe devolver null si no se encuentra un chat privado', async () => {
    const usuarioA = 'userA-id';
    const usuarioB = 'userB-id';

    // Mock del método 'aggregate' para simular la cadena: aggregate().exec()
    (chatModel.aggregate as jest.Mock).mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue([]), // Array vacío = No encontrado
    }));

    const result = await repository.findChatPrivadoByIdUsuarios(
      usuarioA,
      usuarioB,
    );

    // 1. Verificar que se llamó a aggregate
    expect(chatModel.aggregate).toHaveBeenCalled();

    // 2. Verificar el resultado
    expect(result).toBeNull();
  });

  it('debe devolver chats privados de un usuario que coincidan con el filtro de integrantes', async () => {
    const idUsuario = 'user-id-456';
    const mockChatsEncontrados = [
      {
        // Chat Válido: tiene el integrante buscado
        _id: 'chat-1-valido',
        is_group: false,
        estado: Estado.HABILITADO,
        cantidad_integrantes: 2,
        integrantes: [{ _id: 'integ-1' }], // El populate agrega esto
        nombre: 'Chat con UserX',
      },
      {
        // Chat Inválido (Aunque cumpla el find, el populate falló o el integrante no está)
        _id: 'chat-2-invalido',
        is_group: false,
        estado: Estado.HABILITADO,
        cantidad_integrantes: 2,
        integrantes: [], // Esto simula que no encontró el integrante del usuario
        nombre: 'Chat con UserY',
      },
    ];

    // Mock del método 'find' para simular la cadena: find().populate().lean().exec()
    (chatModel.find as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(), // Simular populate
      lean: jest.fn().mockReturnThis(), // Simular lean
      exec: jest.fn().mockResolvedValue(mockChatsEncontrados),
    }));

    const result = await repository.findChatsPrivadosByIdUsuario(idUsuario);

    // 1. Verificar el llamado a 'find'
    expect(chatModel.find).toHaveBeenCalledWith({
      is_group: false,
      estado: Estado.HABILITADO,
      cantidad_integrantes: 2,
    });

    // 2. Verificar el resultado (solo debe devolver el chat válido)
    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe('chat-1-valido');
    expect(result[0].nombre).toBe('Chat con UserX');
  });

  it('debe devolver chats grupales de un usuario que coincidan con los criterios de búsqueda', async () => {
    const idUsuario = 'user-id-grupo';
    const mockChatsGrupales = [
      {
        _id: 'grupo-1',
        is_group: true,
        estado: Estado.HABILITADO,
        integrantes: [{ _id: 'integ-A' }], // Válido
        nombre: 'Grupo Test',
      },
    ];

    // Mock del método 'find'
    (chatModel.find as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockChatsGrupales),
    }));

    const result = await repository.findChatsGrupalesByIdUsuario(idUsuario);

    // 1. Verificar el llamado a 'find' con criterios de grupo
    expect(chatModel.find).toHaveBeenCalledWith({
      is_group: true, // Criterio Clave para Grupal
      estado: Estado.HABILITADO,
    });

    // 2. Verificar el llamado a 'populate' con el match de usuario
    expect(
      (chatModel.find as jest.Mock).mock.results[0].value.populate,
    ).toHaveBeenCalledWith({
      path: 'integrantes',
      match: {
        id_usuario: idUsuario,
        estado: { $in: [Estado.HABILITADO, Estado.DESHABILITADO] },
      },
      select: '_id estado',
    });

    // 3. Verificar el resultado (debe devolver el grupo encontrado)
    expect(result).toHaveLength(1);
    expect(result[0].is_group).toBe(true);
  });
});
