import { AuthUtils } from 'src/modules/auth/application/auth.utils';
import { CrearUsuario } from 'src/modules/auth/application/use-cases/crear-usuario';
import { IUsuarioResponse } from 'src/modules/usuarios/application/usuarios.responses';
import { IUsuariosService } from 'src/modules/usuarios/application/usuarios.service.interface';
import { IRespuesta } from 'src/shared/application/response';

//////////////////////////////
/// PRUEBAS DE ÉXITO ////////
//////////////////////////////

describe('CrearUsuario - Éxito', () => {
  let crearUsuario: CrearUsuario;
  let usuariosServiceMock: jest.Mocked<IUsuariosService>;
  let authUtilsMock: jest.Mocked<AuthUtils>;

  beforeEach(() => {
    usuariosServiceMock = {
      createUsuario: jest.fn(),
      getUsuariosPorNombreOUsername: jest.fn(),
      existeUsuarioPorUsername: jest.fn(),
      disableUsuario: jest.fn(),
      updateUsuario: jest.fn(),
    } as unknown as jest.Mocked<IUsuariosService>;

    authUtilsMock = {
      generarJWT: jest.fn(),
    } as unknown as jest.Mocked<AuthUtils>;

    crearUsuario = new CrearUsuario(usuariosServiceMock, authUtilsMock);
  });

  it('debería crear un usuario y devolver token si todo sale bien', async () => {
    // Arrange
    const mockUser: IUsuarioResponse = {
      id_usuario: '1234dsfsd123d',
      username: 'bell',
      nombre: 'Bellita',
      link_foto: 'foto.png',
      createdAt: new Date(),
    };

    const mockRespuesta: IRespuesta<IUsuarioResponse> = {
      success: true,
      data: mockUser,
      error: null,
    };

    usuariosServiceMock.createUsuario.mockResolvedValue(mockRespuesta);
    authUtilsMock.generarJWT.mockReturnValue('fake-token');

    // Act
    const result = await crearUsuario.execute('Bell', 'bell', '1234');

    // Assert
    expect(usuariosServiceMock.createUsuario).toHaveBeenCalledWith(
      'Bell',
      'bell',
      '1234',
      undefined
    );
    expect(authUtilsMock.generarJWT).toHaveBeenCalledWith(
      '1234dsfsd123d',
      'bell',
    );

    // Validaciones
    expect(result.success).toBe(true);
    expect(result.data?.usuario).toEqual(mockUser);
    expect(result.data?.token).toBe('fake-token');
  });
});

//////////////////////////////
/// PRUEBAS DE ERROR /////////
//////////////////////////////

describe('CrearUsuario - Errores', () => {
  let crearUsuario: CrearUsuario;
  let usuariosServiceMock: jest.Mocked<IUsuariosService>;
  let authUtilsMock: jest.Mocked<AuthUtils>;

  beforeEach(() => {
    usuariosServiceMock = {
      createUsuario: jest.fn(),
      getUsuariosPorNombreOUsername: jest.fn(),
      existeUsuarioPorUsername: jest.fn(),
      disableUsuario: jest.fn(),
      updateUsuario: jest.fn(),
    } as unknown as jest.Mocked<IUsuariosService>;

    authUtilsMock = {
      generarJWT: jest.fn(),
    } as unknown as jest.Mocked<AuthUtils>;

    crearUsuario = new CrearUsuario(usuariosServiceMock, authUtilsMock);
  });

  it('debería devolver error si el servicio falla', async () => {
    // Arrange
    const mockRespuesta: IRespuesta<IUsuarioResponse> = {
      success: false,
      data: null as any, // tipado explícito para evitar conflicto
      error: 'Error al crear usuario',
    };

    usuariosServiceMock.createUsuario.mockResolvedValue(mockRespuesta);

    // Act
    const result = await crearUsuario.execute('Bell', 'bell', '1234');

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Error al crear usuario');
    expect(authUtilsMock.generarJWT).not.toHaveBeenCalled();
  });

  it('debería devolver error si el usuario devuelto es nulo', async () => {
    // Arrange
    const mockRespuesta: IRespuesta<IUsuarioResponse> = {
      success: true,
      data: null,
      error: null,
    };

    usuariosServiceMock.createUsuario.mockResolvedValue(mockRespuesta);

    // Act
    const result = await crearUsuario.execute('Bell', 'bell', '1234');

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(authUtilsMock.generarJWT).not.toHaveBeenCalled();
  });
});
