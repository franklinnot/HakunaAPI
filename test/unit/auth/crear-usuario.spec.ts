import { AuthUtils } from 'src/modules/auth/application/auth.utils';
import { CrearUsuario } from 'src/modules/auth/application/use-cases/crear-usuario';
import { IUsuariosService } from 'src/modules/usuarios/application/usuarios.service.interface';
import { IUsuarioResponse } from 'src/modules/usuarios/application/usuarios.responses';
import { IRespuesta } from 'src/shared/application/response';

describe('CrearUsuario', () => {
  let crearUsuarioCU: CrearUsuario;
  let usuariosServiceMock: jest.Mocked<IUsuariosService>;
  let authUtilsMock: jest.Mocked<AuthUtils>;

  beforeEach(() => {
    // Mocks
    usuariosServiceMock = {
      createUsuario: jest.fn(),
      getUsuariosPorNombreOUsername: jest.fn(),
      existeUsuarioPorUsername: jest.fn(),
      disableUsuario: jest.fn(),
      updateUsuario: jest.fn(),
    } as unknown as jest.Mocked<IUsuariosService>;

    authUtilsMock = {
      generarJWT: jest.fn().mockReturnValue('token-mock'),
    } as unknown as jest.Mocked<AuthUtils>;

    crearUsuarioCU = new CrearUsuario(usuariosServiceMock, authUtilsMock);
  });

  // ----------------------------
  // TEST: ÉXITO
  // ----------------------------
  it('crearUsuario -> éxito', async () => {
    // Arrange
    const usuarioMock: IUsuarioResponse = {
      id_usuario: '1234dsfsd123d',
      username: 'bell',
      nombre: 'Bellita',
      link_foto: 'foto.png',
      createdAt: new Date(),
    };

    const respuestaMock: IRespuesta<IUsuarioResponse> = {
      success: true,
      data: usuarioMock,
      error: null,
    };

    usuariosServiceMock.createUsuario.mockResolvedValue(respuestaMock);
    authUtilsMock.generarJWT.mockReturnValue('fake-token');

    // Act
    const resultado = await crearUsuarioCU.execute('Bell', 'bell', '1234');

    // Assert
    expect(usuariosServiceMock.createUsuario).toHaveBeenCalledWith(
      'Bell',
      'bell',
      '1234',
      undefined,
    );
    expect(authUtilsMock.generarJWT).toHaveBeenCalledWith(
      '1234dsfsd123d',
      'bell',
    );

    expect(resultado.success).toBe(true);
    expect(resultado.data?.usuario).toEqual(usuarioMock);
    expect(resultado.data?.token).toBe('fake-token');
  });

  // ----------------------------
  // TEST: ERROR
  // ----------------------------

  it('crearUsuario -> fallo (error servicio)', async () => {
    // Arrange
    const respuestaMock: IRespuesta<IUsuarioResponse> = {
      success: false,
      data: null as any,
      error: 'Error al crear usuario',
    };

    usuariosServiceMock.createUsuario.mockResolvedValue(respuestaMock);

    // Act
    const resultado = await crearUsuarioCU.execute('Bell', 'bell', '1234');

    // Assert
    expect(resultado.success).toBe(false);
    expect(resultado.error).toBe('Error al crear usuario');
    expect(authUtilsMock.generarJWT).not.toHaveBeenCalled();
  });

  it('crearUsuario -> fallo (datos nulos)', async () => {
    // Arrange
    const respuestaMock: IRespuesta<IUsuarioResponse> = {
      success: true,
      data: null,
      error: null,
    };

    usuariosServiceMock.createUsuario.mockResolvedValue(respuestaMock);

    // Act
    const resultado = await crearUsuarioCU.execute('Bell', 'bell', '1234');

    // Assert
    expect(resultado.success).toBe(false);
    expect(resultado.error).toBeDefined();
    expect(authUtilsMock.generarJWT).not.toHaveBeenCalled();
  });
});
