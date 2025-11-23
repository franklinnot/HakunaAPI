import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MensajeRepository } from '../../../src/modules/mensajes/infraestructure/repositories/mensaje.repository'; // Ajusta la ruta
import { Mensaje } from '../../../src/modules/mensajes/infraestructure/schemas/mensaje.schema'; // Ajusta la ruta
import { Estado } from 'src/shared/domain/enums'; // Ajusta la ruta
import { IMensaje } from '../../../src/modules/mensajes/domain/mensajes.entities'; // Ajusta la ruta
import { IIntegranteRepository } from 'src/modules/chats/infraestructure/chats.repositories.interfaces'; // Ajusta la ruta
import { IIntegrante } from 'src/modules/chats/domain/chats.entities'; // Ajusta la ruta

// --- Mocks de Dependencias ---

// 1. Mock del MensajeModel de Mongoose
const mockMensajeModel = () => ({
  find: jest.fn().mockReturnThis(), // Simula find().sort().exec()
  findOne: jest.fn().mockReturnThis(), // Simula findOne().sort().lean().exec()
  sort: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn(),
});

// 2. Mock del IntegranteRepository (dependencia inyectada)
const mockIntegranteRepository = {
  findAll: jest.fn(),
};

describe('MensajeRepository', () => {
  let repository: MensajeRepository;
  let mensajeModel: ReturnType<typeof mockMensajeModel>;
  let integranteRepository: IIntegranteRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MensajeRepository,
        {
          // Proveer el mock para el token de Mongoose
          provide: getModelToken(Mensaje.name),
          useValue: mockMensajeModel(),
        },
        {
          // Proveer el mock para la dependencia inyectada por token 'IIntegranteRepository'
          provide: 'IIntegranteRepository',
          useValue: mockIntegranteRepository,
        },
      ],
    }).compile();

    repository = module.get<MensajeRepository>(MensajeRepository);
    mensajeModel = module.get(getModelToken(Mensaje.name)) as ReturnType<
      typeof mockMensajeModel
    >;
    integranteRepository = module.get<IIntegranteRepository>(
      'IIntegranteRepository',
    );
  });

  it('1. debe devolver todos los mensajes de un chat, en orden descendente', async () => {
    const chatId = 'chat-group-1';

    // Mocks de la dependencia
    const mockIntegrantes: IIntegrante[] = [
      {
        _id: 'integ-1',
        id_chat: chatId,
        id_usuario: 'user-a',
        is_admin: false,
        estado: Estado.HABILITADO,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: 'integ-2',
        id_chat: chatId,
        id_usuario: 'user-b',
        is_admin: false,
        estado: Estado.HABILITADO,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    (integranteRepository.findAll as jest.Mock).mockResolvedValue(
      mockIntegrantes,
    );

    // Mocks de los resultados de MensajeModel.find().sort().exec()
    const mockMensajes: Mensaje[] = [
      {
        _id: 'msg-reciente',
        id_integrante: 'integ-1',
        descripcion: 'Hola',
        has_files: false,
        estado: Estado.HABILITADO,
        createdAt: new Date('2025-01-02'),
      },
      {
        _id: 'msg-antiguo',
        id_integrante: 'integ-2',
        descripcion: 'Chau',
        has_files: false,
        estado: Estado.HABILITADO,
        createdAt: new Date('2025-01-01'),
      },
    ] as unknown as Mensaje[];
    (mensajeModel.exec as jest.Mock).mockResolvedValue(mockMensajes);

    const result = await repository.findAllByChatId(chatId);

    // 1. Verificar la llamada al IntegranteRepository
    expect(integranteRepository.findAll).toHaveBeenCalledWith({
      id_chat: chatId,
      estado: { $in: [Estado.HABILITADO, Estado.DESHABILITADO] },
    });

    // 2. Verificar la llamada a MensajeModel.find
    expect(mensajeModel.find).toHaveBeenCalledWith({
      id_integrante: { $in: ['integ-1', 'integ-2'] },
      estado: Estado.HABILITADO,
    });

    // 3. Verificar que se aplicó el ordenamiento
    expect(mensajeModel.sort).toHaveBeenCalledWith({ createdAt: -1 });

    // 4. Verificar el resultado y el mapeo
    expect(result).toHaveLength(2);
    expect(result[0]._id).toBe('msg-reciente'); // El orden descendente debe ser respetado
  });

  it('3. debe devolver el mensaje más reciente del chat, mapeado a dominio', async () => {
    const chatId = 'chat-private-2';

    // Mocks de la dependencia (Integrantes)
    const mockIntegrantes: IIntegrante[] = [
      {
        _id: 'integ-3',
        id_chat: chatId,
        id_usuario: 'user-c',
        is_admin: false,
        estado: Estado.HABILITADO,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as unknown as IIntegrante[];
    (integranteRepository.findAll as jest.Mock).mockResolvedValue(
      mockIntegrantes,
    );

    // Mocks de los resultados de MensajeModel.findOne().sort().lean().exec()
    const mockUltimoMensaje: Mensaje = {
      _id: 'msg-ultimo',
      id_integrante: 'integ-3',
      descripcion: 'Último mensaje',
      has_files: true,
      estado: Estado.HABILITADO,
      createdAt: new Date(),
    } as unknown as Mensaje;
    (mensajeModel.exec as jest.Mock).mockResolvedValue(mockUltimoMensaje); // findOne.exec() devuelve un objeto

    const result = await repository.findUltimoMensajeByChatId(chatId);

    // 1. Verificar la llamada a MensajeModel.findOne
    expect(mensajeModel.findOne).toHaveBeenCalledWith({
      id_integrante: { $in: ['integ-3'] },
      estado: Estado.HABILITADO,
    });

    // 2. Verificar que se aplicó el ordenamiento y lean
    expect(mensajeModel.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(mensajeModel.lean).toHaveBeenCalled();

    // 3. Verificar el resultado y el mapeo
    expect(result).not.toBeNull();
    expect(result!._id).toBe('msg-ultimo');
    expect(result!.descripcion).toBe('Último mensaje');
  });

  it('4. debe mapear correctamente un documento de Mongoose a la entidad de dominio IMensaje', () => {
    const now = new Date();
    // Simular el documento que retorna Mongoose
    const mockDoc: Mensaje = {
      _id: 'mongo-msg-123',
      createdAt: now,
      updatedAt: now,
      estado: Estado.HABILITADO,
      id_integrante: 'integ-parent-1',
      descripcion: 'Mensaje de prueba',
      has_files: true,
    } as unknown as Mensaje;

    // Acceso al método protegido para la prueba
    const result: IMensaje = (repository as any).toDomain(mockDoc);

    // Verificar el mapeo
    expect(result._id).toBe('mongo-msg-123');
    expect(result.estado).toBe(Estado.HABILITADO);
    expect(result.id_integrante).toBe('integ-parent-1');
    expect(result.descripcion).toBe('Mensaje de prueba');
    expect(result.has_files).toBe(true);
  });

  it('5. debe devolver null en la descripción si el campo no existe o es nulo', () => {
    // Simular un mensaje que solo contiene archivos (sin texto)
    const mockDocSinDescripcion: Mensaje = {
      _id: 'mongo-msg-456',
      createdAt: new Date(),
      updatedAt: new Date(),
      estado: Estado.HABILITADO,
      id_integrante: 'integ-parent-2',
      descripcion: null, // o undefined
      has_files: true,
    } as unknown as Mensaje;

    // Acceso al método protegido para la prueba
    const result: IMensaje = (repository as any).toDomain(
      mockDocSinDescripcion,
    );

    // Verificar que la descripción es null (como se espera en el mapeo doc.descripcion || null)
    expect(result.descripcion).toBeNull();
    expect(result.has_files).toBe(true);
  });
});
