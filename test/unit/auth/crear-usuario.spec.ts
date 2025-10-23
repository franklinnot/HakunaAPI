import { IAuthService } from '../../../src/modules/auth/application/auth.service.interface';
import { AuthService } from '../../../src/modules/auth/application/auth.service';
import { CrearUsuario } from '../../../src/modules/auth/application/use-cases/crear-usuario';
import { IniciarSesion } from '../../../src/modules/auth/application/use-cases/iniciar-sesion';
import { GetUsuarioByJWT } from '../../../src/modules/auth/application/use-cases/get-usuario-by-jwt';

describe('AuthService', () => {
  let authService: IAuthService;
  // casos de uso
  let crearUsuarioCU: jest.Mocked<CrearUsuario>;
  let iniciarSesionCU: jest.Mocked<IniciarSesion>;
  let getUsuarioByJWTCU: jest.Mocked<GetUsuarioByJWT>;

  beforeEach(() => {
    // Mock de casos de uso
    crearUsuarioCU = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CrearUsuario>;

    iniciarSesionCU = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<IniciarSesion>;

    getUsuarioByJWTCU = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetUsuarioByJWT>;

    // Servicio real usando los casos de uso mockeados
    authService = new AuthService(
      iniciarSesionCU,
      crearUsuarioCU,
      getUsuarioByJWTCU,
    );
  });

  // ----------------------------
  // TEST: CREAR USUARIO
  // ----------------------------
  it('crearUsuario -> éxito', async () => {
    // Arrange
    const usuarioResponseMock = {
      id_usuario: 'id123',
      username: 'bell',
      nombre: 'Bellita',
      link_foto: 'foto.png',
      createdAt: new Date(),
    };
    crearUsuarioCU.execute.mockResolvedValue({
      success: true,
      data: { usuario: usuarioResponseMock, token: 'token-fake' },
    });

    // Act
    const resultado = await authService.crearUsuario('Bellita', 'bell', '1234');

    // Assert
    expect(resultado.success).toBe(true);
    expect(resultado.data?.usuario).toEqual(usuarioResponseMock);
    expect(resultado.data?.token).toBe('token-fake');
  });

  it('crearUsuario -> fallo', async () => {
    // Arrange
    crearUsuarioCU.execute.mockResolvedValue({
      success: false,
      data: null,
      error: 'Error al crear usuario',
    });

    // Act
    const resultado = await authService.crearUsuario('Bellita', 'bell', '1234');

    // Assert
    expect(resultado.success).toBe(false);
    expect(resultado.error).toBe('Error al crear usuario');
  });
});
