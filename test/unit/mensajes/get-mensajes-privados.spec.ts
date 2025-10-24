/* eslint-disable @typescript-eslint/unbound-method */
import { GetMensajesPrivados } from 'src/modules/mensajes/application/use-cases/get-mensajes-privados';
import { Estado } from 'src/shared/domain/enums';
import { MensajesUtils } from 'src/modules/mensajes/application/mensajes.utils';
import { IIntegranteRepository } from 'src/modules/chats/infraestructure/chats.repositories.interfaces';
import { IMensajeRepository } from 'src/modules/mensajes/infraestructure/mensajes.repositories.interfaces';
import { IIntegrante } from 'src/modules/chats/domain/chats.entities';
import { IMensaje } from 'src/modules/mensajes/domain/mensajes.entities';
import { IArchivoResponse } from 'src/modules/archivos/application/archivos.responses';

describe('GetMensajesPrivados', () => {
  let getMensajesPrivados: GetMensajesPrivados;

  let integranteRepository: jest.Mocked<IIntegranteRepository>;
  let mensajeRepository: jest.Mocked<IMensajeRepository>;
  let mensajesUtils: jest.Mocked<MensajesUtils>;

  beforeEach(() => {
    integranteRepository = {
      findOne: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<IIntegranteRepository>;

    mensajeRepository = {
      findAllByChatId: jest.fn(),
    } as unknown as jest.Mocked<IMensajeRepository>;

    mensajesUtils = {
      obtenerDetalles: jest.fn(),
    } as unknown as jest.Mocked<MensajesUtils>;

    getMensajesPrivados = new GetMensajesPrivados(
      integranteRepository,
      mensajeRepository,
      mensajesUtils,
    );
  });

  it('debe retornar error si el usuario no pertenece al chat o está deshabilitado', async () => {
    integranteRepository.findOne.mockResolvedValue(null);

    const result = await getMensajesPrivados.execute('user1', 'chat1');
    expect(result.success).toBe(false);
    expect(result.error).toBe('El usuario no pertenece a este chat.');

    // Caso: integrante deshabilitado
    integranteRepository.findOne.mockResolvedValueOnce({
      id_usuario: 'user1',
      id_chat: 'chat1',
      estado: Estado.DESHABILITADO,
    } as IIntegrante);

    const result2 = await getMensajesPrivados.execute('user1', 'chat1');
    expect(result2.success).toBe(false);
    expect(result2.error).toBe('El usuario no pertenece a este chat.');
  });

  it('debe retornar una lista vacía si no hay mensajes en el chat', async () => {
    integranteRepository.findOne.mockResolvedValue({
      id_usuario: 'user1',
      id_chat: 'chat1',
      estado: Estado.HABILITADO,
    } as IIntegrante);

    mensajeRepository.findAllByChatId.mockResolvedValue([]);

    const result = await getMensajesPrivados.execute('user1', 'chat1');
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('debe retornar los mensajes correctamente sin archivos adjuntos', async () => {
    integranteRepository.findOne.mockResolvedValue({
      id_usuario: 'user1',
      id_chat: 'chat1',
      estado: Estado.HABILITADO,
    } as IIntegrante);

    const mensajes = [
      {
        _id: 'm1',
        id_integrante: 'i1',
        descripcion: 'Hola',
        has_files: false,
        createdAt: new Date('2024-01-01'),
        estado: Estado.HABILITADO,
      },
      {
        _id: 'm2',
        id_integrante: 'i2',
        descripcion: 'Qué tal',
        has_files: false,
        createdAt: new Date('2024-01-02'),
        estado: Estado.HABILITADO,
      },
    ];

    mensajeRepository.findAllByChatId.mockResolvedValue(mensajes as IMensaje[]);

    integranteRepository.findById.mockImplementation((id: string) => {
      if (id === 'i1')
        return Promise.resolve({ id_usuario: 'user1' } as IIntegrante);
      if (id === 'i2')
        return Promise.resolve({ id_usuario: 'user2' } as IIntegrante);
      return Promise.resolve(null);
    });

    mensajesUtils.obtenerDetalles.mockResolvedValue([]);

    const result = await getMensajesPrivados.execute('user1', 'chat1');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data?.[0].id_usuario).toBe('user1');
    expect(result.data?.[1].id_usuario).toBe('user2');
  });

  it('debe incluir detalles de archivos cuando has_files es true', async () => {
    integranteRepository.findOne.mockResolvedValue({
      id_usuario: 'user1',
      id_chat: 'chat1',
      estado: Estado.HABILITADO,
    } as IIntegrante);

    const mensajes = [
      {
        _id: 'm1',
        id_integrante: 'i1',
        descripcion: 'Foto',
        has_files: true,
        createdAt: new Date(),
        estado: Estado.HABILITADO,
      },
    ];

    mensajeRepository.findAllByChatId.mockResolvedValue(mensajes as IMensaje[]);
    integranteRepository.findById.mockResolvedValue({
      id_usuario: 'user1',
    } as IIntegrante);

    mensajesUtils.obtenerDetalles.mockResolvedValue([
      { id_archivo: 'a1', link: 'some-link.jpg' },
    ] as IArchivoResponse[]);

    const result = await getMensajesPrivados.execute('user1', 'chat1');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0].archivos).toEqual([
      { id_archivo: 'a1', link: 'some-link.jpg' },
    ]);
    expect(mensajesUtils.obtenerDetalles).toHaveBeenCalledWith('m1');
  });
});
