import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IntegranteRepository } from '../../../src/modules/chats/infraestructure/repositories/integrante.repository'; 
import { Estado } from 'src/shared/domain/enums';
import { Integrante } from '../../../src/modules/chats/infraestructure/schemas/integrante.schema'; // Ajusta la ruta
import { IIntegrante } from '../../../src/modules/chats/domain/chats.entities'; // Ajusta la ruta

// Mock de la clase Model de Mongoose, solo necesitamos 'create' para el método custom.
const mockIntegranteModel = () => ({
  create: jest.fn(),
});

describe('IntegranteRepository', () => {
  let repository: IntegranteRepository;
  let integranteModel: Model<Integrante>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegranteRepository,
        {
          // Provee el mock para el token del modelo Integrante
          provide: getModelToken(Integrante.name),
          useValue: mockIntegranteModel(),
        },
      ],
    }).compile();

    repository = module.get<IntegranteRepository>(IntegranteRepository);
    integranteModel = module.get<Model<Integrante>>(getModelToken(Integrante.name));
  });
  //TEST 1
  it('debe registrar múltiples integrantes y devolverlos como entidades de dominio', async () => {
    const chatId = 'chat-id-test';
    const usuariosInput = [
      { id_usuario: 'user-a', is_admin: true },
      { id_usuario: 'user-b', is_admin: false },
    ];

    // Mock de lo que Mongoose.create devuelve para cada llamada
    const mockCreatedDocs = usuariosInput.map((input, index) => ({
      _id: `integ-id-${index}`,
      id_chat: chatId,
      id_usuario: input.id_usuario,
      is_admin: input.is_admin,
      estado: Estado.HABILITADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Simular el comportamiento de Promise.all(create())
    (integranteModel.create as jest.Mock)
      .mockResolvedValueOnce(mockCreatedDocs[0])
      .mockResolvedValueOnce(mockCreatedDocs[1]);

    const result = await repository.registerIntegrantes(chatId, usuariosInput);

    // 1. Verificar que 'create' fue llamado el número correcto de veces
    expect(integranteModel.create).toHaveBeenCalledTimes(2);

    // 2. Verificar que el llamado incluye la data correcta para el primer elemento
    expect(integranteModel.create).toHaveBeenCalledWith({
      id_chat: chatId,
      id_usuario: 'user-a',
      is_admin: true,
    });

    // 3. Verificar que el resultado final tiene la longitud correcta y fue mapeado
    expect(result).toHaveLength(2);
    expect(result[0]._id).toBe('integ-id-0');
    expect(result[1].id_usuario).toBe('user-b');
    expect(result[1].is_admin).toBe(false);
  });
    //TEST 2
  it('debe devolver un array vacío si la lista de usuarios para registrar está vacía', async () => {
    const chatId = 'chat-id-test';
    const usuariosInput: { id_usuario: string; is_admin: boolean }[] = [];

    // Limpiar el mock para asegurar que no haya llamadas previas
    (integranteModel.create as jest.Mock).mockClear();

    const result = await repository.registerIntegrantes(chatId, usuariosInput);

    // 1. Verificar que el método 'create' nunca fue llamado
    expect(integranteModel.create).not.toHaveBeenCalled();

    // 2. Verificar que el resultado es un array vacío
    expect(result).toEqual([]);
  });

  //TEST 3
  it('debe mapear correctamente un documento de Mongoose a la entidad de dominio IIntegrante', () => {
    const now = new Date();
    // Simular el documento que retorna Mongoose
    const mockDoc: Integrante = {
      _id: 'mongo-id-123',
      createdAt: now,
      updatedAt: now,
      estado: Estado.DESHABILITADO,
      id_chat: 'chat-abc',
      id_usuario: 'user-xyz',
      is_admin: true,
    } as unknown as Integrante; 

    // Acceso al método protegido para la prueba
    const result: IIntegrante = (repository as any).toDomain(mockDoc);

    // Verificar el mapeo de los campos base
    expect(result._id).toBe('mongo-id-123');
    expect(result.estado).toBe(Estado.DESHABILITADO);

    // Verificar el mapeo de los campos específicos de Integrante
    expect(result.id_chat).toBe('chat-abc');
    expect(result.id_usuario).toBe('user-xyz');
    expect(result.is_admin).toBe(true);
  });
});
  