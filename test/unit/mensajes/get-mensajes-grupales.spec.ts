import { GetMensajesGrupales } from 'src/modules/mensajes/application/use-cases/get-mensajes-grupales';
import { Estado } from 'src/shared/domain/enums';
import type { IIntegranteRepository } from 'src/modules/chats/infraestructure/chats.repositories.interfaces';
import type { IMensajeRepository } from 'src/modules/mensajes/infraestructure/mensajes.repositories.interfaces';
import { MensajesUtils } from 'src/modules/mensajes/application/mensajes.utils';
import type { IIntegrante } from 'src/modules/chats/domain/chats.entities';
import type { IMensaje } from 'src/modules/mensajes/domain/mensajes.entities';
import { QueryFilter } from 'src/shared/infraestructure/infraestructure.types';
import { IArchivoResponse } from 'src/modules/archivos/application/archivos.responses';

describe('GetMensajesGrupales', () => {
  let getMensajesGrupales: GetMensajesGrupales;

  let integranteRepository: jest.Mocked<IIntegranteRepository>;
  let mensajeRepository: jest.Mocked<IMensajeRepository>;
  let mensajesUtils: jest.Mocked<MensajesUtils>;

  beforeEach(() => {
    integranteRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<IIntegranteRepository>;

    mensajeRepository = {
      findAllByChatId: jest.fn(),
    } as unknown as jest.Mocked<IMensajeRepository>;

    mensajesUtils = {
      obtenerDetalles: jest.fn(),
    } as unknown as jest.Mocked<MensajesUtils>;

    getMensajesGrupales = new GetMensajesGrupales(
      integranteRepository,
      mensajeRepository,
      mensajesUtils,
    );
  });

  it('debe retornar error si el usuario no pertenece al chat grupal', async () => {
    integranteRepository.findOne.mockResolvedValue(null);

    const result = await getMensajesGrupales.execute('user1', 'chat1');

    expect(result.success).toBe(false);
    expect(result.error).toBe('El usuario no pertenece a este chat grupal.');
  });

  it('debe retornar lista vacía si no hay mensajes', async () => {
    integranteRepository.findOne.mockResolvedValue({
      id_usuario: 'user1',
      id_chat: 'chat1',
      estado: Estado.HABILITADO,
    } as IIntegrante);

    mensajeRepository.findAllByChatId.mockResolvedValue([]);

    const result = await getMensajesGrupales.execute('user1', 'chat1');

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('debe retornar mensajes correctamente sin archivos adjuntos', async () => {
    integranteRepository.findOne.mockImplementation(
      (filter: QueryFilter<IIntegrante>) => {
        // primer llamado: verificación del usuario participante
        if (filter.id_usuario === 'user1') {
          return Promise.resolve({
            id_usuario: 'user1',
            id_chat: 'chat1',
            estado: Estado.HABILITADO,
          } as IIntegrante);
        }
        // llamados dentro del for (mensaje.id_integrante)
        if (filter._id === 'i1')
          return Promise.resolve({ id_usuario: 'user1' } as IIntegrante);
        if (filter._id === 'i2')
          return Promise.resolve({ id_usuario: 'user2' } as IIntegrante);
        return Promise.resolve(null);
      },
    );

    const mensajes = [
      {
        _id: 'm1',
        id_integrante: 'i1',
        descripcion: 'Hola grupo',
        has_files: false,
        createdAt: new Date('2024-01-01'),
        estado: Estado.HABILITADO,
      },
      {
        _id: 'm2',
        id_integrante: 'i2',
        descripcion: 'Qué tal todos',
        has_files: false,
        createdAt: new Date('2024-01-02'),
        estado: Estado.HABILITADO,
      },
    ];

    mensajeRepository.findAllByChatId.mockResolvedValue(mensajes as IMensaje[]);
    mensajesUtils.obtenerDetalles.mockResolvedValue([]);

    const result = await getMensajesGrupales.execute('user1', 'chat1');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data?.[0].id_usuario).toBe('user1');
    expect(result.data?.[1].id_usuario).toBe('user2');
  });

  it('debe incluir detalles de archivos cuando has_files es true', async () => {
    integranteRepository.findOne.mockImplementation(
      (filter: QueryFilter<IIntegrante>) => {
        if (filter.id_usuario === 'user1')
          return Promise.resolve({
            id_usuario: 'user1',
            id_chat: 'chat1',
            estado: Estado.HABILITADO,
          } as IIntegrante);
        if (filter._id === 'i1')
          return Promise.resolve({ id_usuario: 'user1' } as IIntegrante);
        return Promise.resolve(null);
      },
    );

    const mensajes = [
      {
        _id: 'm1',
        id_integrante: 'i1',
        descripcion: 'Con archivo',
        has_files: true,
        createdAt: new Date('2024-01-03'),
        estado: Estado.HABILITADO,
      },
    ];

    mensajeRepository.findAllByChatId.mockResolvedValue(mensajes as IMensaje[]);
    mensajesUtils.obtenerDetalles.mockResolvedValue([
      { id_archivo: 'f1', nombre: 'foto.png' },
    ] as IArchivoResponse[]);

    const result = await getMensajesGrupales.execute('user1', 'chat1');

    expect(result.success).toBe(true);
    expect(result.data?.[0].archivos).toHaveLength(1);
    expect(result.data?.[0].archivos?.[0].nombre).toBe('foto.png');
  });
});
