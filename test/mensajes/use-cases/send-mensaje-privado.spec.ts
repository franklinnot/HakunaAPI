import { SendMensajePrivado } from 'src/modules/mensajes/application/use-cases/send-mensaje-privado';
import { Estado, TipoArchivo } from 'src/shared/domain/enums';
import type {
  IChatRepository,
  IIntegranteRepository,
} from 'src/modules/chats/infraestructure/chats.repositories.interfaces';
import type {
  IMensajeRepository,
  IViewerRepository,
  IDetalleMensajeRepository,
} from 'src/modules/mensajes/infraestructure/mensajes.repositories.interfaces';
import type { IArchivosService } from 'src/modules/archivos/application/archivos.service.interface';
import type { IChatsService } from 'src/modules/chats/application/chats.service.interface';
import type { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import {
  IDetalleMensaje,
  IMensaje,
  IViewer,
} from 'src/modules/mensajes/domain/mensajes.entities';
import { IChat, IIntegrante } from 'src/modules/chats/domain/chats.entities';
import { IRespuesta } from 'src/shared/application/response';
import { IChatPrivadoResponse } from 'src/modules/chats/application/chats.responses';
import { IArchivoResponse } from 'src/modules/archivos/application/archivos.responses';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('SendMensajePrivado', () => {
  let sendMensajePrivado: SendMensajePrivado;

  let chatRepository: jest.Mocked<IChatRepository>;
  let integranteRepository: jest.Mocked<IIntegranteRepository>;
  let mensajeRepository: jest.Mocked<IMensajeRepository>;
  let viewerRepository: jest.Mocked<IViewerRepository>;
  let detalleRepository: jest.Mocked<IDetalleMensajeRepository>;
  let archivosService: jest.Mocked<IArchivosService>;
  let chatsService: jest.Mocked<IChatsService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const usuarioEmisor: IUsuario = {
    _id: 'userA',
    nombre: 'Frank',
    username: 'frank',
    id_foto: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    password: '',
    estado: Estado.HABILITADO,
  };

  const id_usuarioReceptor = 'userB';

  beforeEach(() => {
    chatRepository = {
      findChatPrivadoByIdUsuarios: jest.fn(),
    } as unknown as jest.Mocked<IChatRepository>;

    integranteRepository = {
      findOne: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<IIntegranteRepository>;

    mensajeRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<IMensajeRepository>;

    viewerRepository = {
      registrarViewers: jest.fn(),
    } as unknown as jest.Mocked<IViewerRepository>;

    detalleRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<IDetalleMensajeRepository>;

    archivosService = {
      saveImagen: jest.fn(),
    } as unknown as jest.Mocked<IArchivosService>;

    chatsService = {
      crearChatPrivado: jest.fn(),
    } as unknown as jest.Mocked<IChatsService>;

    eventEmitter = {
      emit: jest.fn(),
    } as unknown as jest.Mocked<EventEmitter2>;

    sendMensajePrivado = new SendMensajePrivado(
      chatRepository,
      integranteRepository,
      mensajeRepository,
      viewerRepository,
      detalleRepository,
      archivosService,
      chatsService,
      eventEmitter,
    );
  });

  it('debe enviar un mensaje privado exitosamente cuando existe el chat', async () => {
    chatRepository.findChatPrivadoByIdUsuarios.mockResolvedValue({
      _id: 'chat123',
    } as IChat);
    integranteRepository.findOne.mockResolvedValue({
      _id: 'intA',
    } as IIntegrante);
    integranteRepository.findAll.mockResolvedValue([
      { _id: 'intA', id_usuario: 'userA' } as Partial<any>,
      { _id: 'intB', id_usuario: 'userB' } as Partial<any>,
    ] as IIntegrante[]);
    mensajeRepository.create.mockResolvedValue({
      _id: 'msg123',
      createdAt: new Date(),
      estado: Estado.HABILITADO,
    } as IMensaje);
    viewerRepository.registrarViewers.mockResolvedValue([] as IViewer[]);

    const resultado = await sendMensajePrivado.execute(
      usuarioEmisor,
      id_usuarioReceptor,
      'Hola mundo',
    );

    expect(resultado.success).toBe(true);
    expect(resultado.data?.descripcion).toBe('Hola mundo');
  });

  it('debe crear un chat privado nuevo si no existía antes', async () => {
    chatRepository.findChatPrivadoByIdUsuarios.mockResolvedValue(null);
    chatsService.crearChatPrivado.mockResolvedValue({
      success: true,
      data: { id_chat: 'newChat' } as Partial<IChatPrivadoResponse>,
    } as IRespuesta<IChatPrivadoResponse>);
    integranteRepository.findOne.mockResolvedValue({
      _id: 'intA',
    } as IIntegrante);
    integranteRepository.findAll.mockResolvedValue([
      { _id: 'intA', id_usuario: 'userA' } as Partial<IIntegrante>,
      { _id: 'intB', id_usuario: 'userB' } as Partial<IIntegrante>,
    ] as IIntegrante[]);
    mensajeRepository.create.mockResolvedValue({
      _id: 'msg999',
      createdAt: new Date(),
      estado: Estado.HABILITADO,
    } as IMensaje);
    viewerRepository.registrarViewers.mockResolvedValue([] as IViewer[]);

    const resultado = await sendMensajePrivado.execute(
      usuarioEmisor,
      id_usuarioReceptor,
      'Nuevo chat',
    );
    expect(resultado.success).toBe(true);
    expect(resultado.data?.id_chat).toBe('newChat');
  });

  it('debe enviar un mensaje con archivos correctamente', async () => {
    chatRepository.findChatPrivadoByIdUsuarios.mockResolvedValue({
      _id: 'chat123',
    } as IChat);
    integranteRepository.findOne.mockResolvedValue({
      _id: 'intA',
    } as IIntegrante);
    integranteRepository.findAll.mockResolvedValue([
      { _id: 'intA', id_usuario: 'userA' } as Partial<IIntegrante>,
      { _id: 'intB', id_usuario: 'userB' } as Partial<IIntegrante>,
    ] as IIntegrante[]);
    mensajeRepository.create.mockResolvedValue({
      _id: 'msgArch',
      createdAt: new Date(),
      estado: Estado.HABILITADO,
    } as IMensaje);
    archivosService.saveImagen.mockResolvedValue({
      success: true,
      data: { id_archivo: 'arch123', nombre: 'foto.png' } as Partial<any>,
    } as IRespuesta<IArchivoResponse>);
    viewerRepository.registrarViewers.mockResolvedValue([] as IViewer[]);
    detalleRepository.create.mockResolvedValue({} as IDetalleMensaje);

    const archivos = [
      { tipoArchivo: TipoArchivo.IMAGEN, b64: 'b64data', nombre: 'foto.png' },
    ];

    const resultado = await sendMensajePrivado.execute(
      usuarioEmisor,
      id_usuarioReceptor,
      'Con imagen',
      archivos,
    );

    expect(resultado.success).toBe(true);
    expect(resultado.data?.has_files).toBe(true);
  });

  it('debe fallar si no se envía descripción ni archivos', async () => {
    const resultado = await sendMensajePrivado.execute(
      usuarioEmisor,
      id_usuarioReceptor,
    );
    expect(resultado.success).toBe(false);
  });

  it('debe fallar si el usuario intenta enviarse un mensaje a sí mismo', async () => {
    const resultado = await sendMensajePrivado.execute(
      usuarioEmisor,
      'userA',
      'Auto-msg',
    );
    expect(resultado.success).toBe(false);
  });

  it('debe fallar si el integrante no puede enviar mensajes', async () => {
    chatRepository.findChatPrivadoByIdUsuarios.mockResolvedValue({
      _id: 'chat123',
    } as IChat);
    integranteRepository.findOne.mockResolvedValue(null);

    const resultado = await sendMensajePrivado.execute(
      usuarioEmisor,
      id_usuarioReceptor,
      'Hola bloqueado',
    );

    expect(resultado.success).toBe(false);
  });
});
