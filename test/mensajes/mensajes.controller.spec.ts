/* eslint-disable @typescript-eslint/unbound-method */
import { MensajesController } from 'src/modules/mensajes/presentation/mensajes.controller';
import type { IMensajesService } from 'src/modules/mensajes/application/mensajes.service.interface';
import {
  EnviarMensajePrivadoDto,
  EnviarMensajeGrupalDto,
} from 'src/modules/mensajes/presentation/mensajes.dtos';
import { IRespuesta } from 'src/shared/application/response';
import {
  IMensajePrivadoResponse,
  IMensajeGrupalResponse,
  IMensajeResponse,
} from 'src/modules/mensajes/application/mensajes.responses';
import { Estado, TipoArchivo } from 'src/shared/domain/enums';

describe('MensajesController', () => {
  let controller: MensajesController;
  let mensajesService: jest.Mocked<IMensajesService>;

  const mockUser = {
    _id: 'u123',
    nombre: 'Frank',
  };

  const mockRequest = {
    user: { data: mockUser },
  } as any;

  beforeEach(() => {
    mensajesService = {
      sendMensajePrivado: jest.fn(),
      getMensajesPrivados: jest.fn(),
      sendMensajeGrupal: jest.fn(),
      getMensajesGrupales: jest.fn(),
    } as unknown as jest.Mocked<IMensajesService>;

    controller = new MensajesController(mensajesService);
  });

  // ----------------------------------------------------------------
  // TEST 1: Enviar mensaje privado
  // ----------------------------------------------------------------
  it('debe enviar un mensaje privado correctamente', async () => {
    const dto: EnviarMensajePrivadoDto = {
      descripcion: 'Hola!',
      archivos: [
        {
          nombre: 'file1.png',
          tipoArchivo: TipoArchivo.IMAGEN,
          b64: 'iVBORw0KGgoAAAANSUhEUgAAAAUA',
        },
      ],
    };
    const id_usuarioB = 'u999';

    const expectedResponse: IRespuesta<IMensajePrivadoResponse> = {
      success: true,
      data: {
        id_mensaje: 'm001',
        id_usuario: mockUser._id,
        id_usuarioB,
        id_chat: 'chat_privado',
        is_group: false,
        descripcion: dto.descripcion,
        has_files: true,
        createdAt: new Date(),
        estado: Estado.HABILITADO,
        archivos: [
          {
            id_archivo: 'a002',
            nombre: 'file2.jpg',
            link: 'https://cdn/files/file2.jpg',
            tipo_archivo: TipoArchivo.IMAGEN,
            extension: 'jpg',
            size: '2MB',
            estado: Estado.HABILITADO,
          },
        ],
      },
    };

    mensajesService.sendMensajePrivado.mockResolvedValue(expectedResponse);

    const result = await controller.sendMensajePrivado(
      mockRequest,
      dto,
      id_usuarioB,
    );

    expect(result).toBe(expectedResponse);
    expect(mensajesService.sendMensajePrivado).toHaveBeenCalledWith(
      mockUser,
      id_usuarioB,
      dto.descripcion,
      dto.archivos,
    );
  });

  // ----------------------------------------------------------------
  // TEST 2: Obtener mensajes privados
  // ----------------------------------------------------------------
  it('debe obtener mensajes privados', async () => {
    const id_chat = 'c001';
    const expectedResponse: IRespuesta<IMensajePrivadoResponse[]> = {
      success: true,
      data: [],
    };
    mensajesService.getMensajesPrivados.mockResolvedValue(expectedResponse);

    const result = await controller.getMensajesPrivados(mockRequest, id_chat);

    expect(result).toBe(expectedResponse);
    expect(mensajesService.getMensajesPrivados).toHaveBeenCalledWith(
      mockUser._id,
      id_chat,
    );
  });

  // ----------------------------------------------------------------
  // TEST 3: Obtener mensajes grupales
  // ----------------------------------------------------------------
  it('debe obtener mensajes grupales', async () => {
    const id_chat = 'g001';
    const expectedResponse: IRespuesta<IMensajeGrupalResponse[]> = {
      success: true,
      data: [],
    };
    mensajesService.getMensajesGrupales.mockResolvedValue(expectedResponse);

    const result = await controller.getMensajesGrupales(mockRequest, id_chat);

    expect(result).toBe(expectedResponse);
    expect(mensajesService.getMensajesGrupales).toHaveBeenCalledWith(
      mockUser._id,
      id_chat,
    );
  });

  // ----------------------------------------------------------------
  // TEST 4: Enviar mensaje grupal
  // ----------------------------------------------------------------
  it('debe enviar mensaje grupal correctamente', async () => {
    const id_chat = 'g001';
    const dto: EnviarMensajeGrupalDto = {
      descripcion: 'Saludos grupo!',
      archivos: [
        {
          nombre: 'file2.png',
          tipoArchivo: TipoArchivo.IMAGEN,
          b64: 'iVBORw0KGgoAAAANSUhEUgAAAAUA',
        },
      ],
    };

    const expectedResponse: IRespuesta<IMensajeGrupalResponse> = {
      success: true,
      data: {
        id_mensaje: 'm002',
        id_usuario: mockUser._id,
        id_chat,
        is_group: true,
        descripcion: dto.descripcion,
        has_files: true,
        createdAt: new Date(),
        archivos: [
          {
            id_archivo: 'a001',
            nombre: 'file1.png',
            link: 'https://cdn/files/file1.png',
            tipo_archivo: TipoArchivo.IMAGEN,
            extension: 'png',
            size: '1MB',
            estado: Estado.HABILITADO,
          },
        ],
        estado: Estado.HABILITADO,
      },
    };

    mensajesService.sendMensajeGrupal.mockResolvedValue(expectedResponse);

    const result = await controller.sendMensajeGrupal(
      mockRequest,
      dto,
      id_chat,
    );

    expect(result).toBe(expectedResponse);
    expect(mensajesService.sendMensajeGrupal).toHaveBeenCalledWith(
      mockUser,
      id_chat,
      dto.descripcion,
      dto.archivos,
    );
  });
});
