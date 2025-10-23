/* eslint-disable @typescript-eslint/unbound-method */
import { IniciarSesion } from 'src/modules/auth/application/use-cases/iniciar-sesion';
import * as bcrypt from 'bcrypt';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import { UsuariosUtils } from 'src/modules/usuarios/application/usuarios.utils';
import { AuthUtils } from 'src/modules/auth/application/auth.utils';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';

jest.mock('bcrypt');

describe('IniciarSesion', () => {
  let iniciarSesion: IniciarSesion;
  let usuarioRepository: jest.Mocked<IUsuarioRepository>;
  let usuariosUtils: jest.Mocked<UsuariosUtils>;
  let authUtils: jest.Mocked<AuthUtils>;

  beforeEach(() => {
    usuarioRepository = {
      findOneByUsernameWithPass: jest.fn(),
    } as unknown as jest.Mocked<IUsuarioRepository>;

    usuariosUtils = {
      getUsuarioResponse: jest.fn(),
    } as unknown as jest.Mocked<UsuariosUtils>;

    authUtils = {
      generarJWT: jest.fn(),
    } as unknown as jest.Mocked<AuthUtils>;

    iniciarSesion = new IniciarSesion(
      usuarioRepository,
      usuariosUtils,
      authUtils,
    );
  });

  // ----------------------------------------------------------------
  // TEST 1: Usuario no encontrado o contraseña incorrecta
  // ----------------------------------------------------------------
  it('debe retornar error si el usuario no existe', async () => {
    usuarioRepository.findOneByUsernameWithPass.mockResolvedValue(null);

    const result = await iniciarSesion.execute('ghost', '123456');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Credenciales incorrectas.');
  });

  it('debe retornar error si la contraseña es incorrecta', async () => {
    const mockUser = {
      _id: 'user123',
      username: 'frank',
      password: 'hashed-pass',
    };

    usuarioRepository.findOneByUsernameWithPass.mockResolvedValue(
      mockUser as IUsuario,
    );
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await iniciarSesion.execute('frank', 'wrong-pass');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Credenciales incorrectas.');
  });

  // ----------------------------------------------------------------
  // TEST 2: Inicio de sesión exitoso
  // ----------------------------------------------------------------
  it('debe retornar token y usuario al iniciar sesión correctamente', async () => {
    const mockUser = {
      _id: 'user123',
      username: 'frank',
      password: 'hashed-pass',
    };

    const mockUsuarioResponse = {
      id_usuario: 'user123',
      username: 'frank',
      nombre: 'Frank',
      link_foto: 'foto.png',
      createdAt: new Date(),
    };

    usuarioRepository.findOneByUsernameWithPass.mockResolvedValue(
      mockUser as IUsuario,
    );
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    usuariosUtils.getUsuarioResponse.mockResolvedValue(mockUsuarioResponse);
    authUtils.generarJWT.mockReturnValue('jwt-token-mock');

    const result = await iniciarSesion.execute('frank', '123456');

    expect(result.success).toBe(true);
    expect(result.data?.usuario).toEqual(mockUsuarioResponse);
    expect(result.data?.token).toBe('jwt-token-mock');
    expect(usuarioRepository.findOneByUsernameWithPass).toHaveBeenCalledWith(
      'frank',
    );
    expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashed-pass');
    expect(authUtils.generarJWT).toHaveBeenCalledWith('user123', 'frank');
  });

  // ----------------------------------------------------------------
  // TEST 3: Error inesperado (por ejemplo, falla en repo)
  // ----------------------------------------------------------------
  it('debe propagar errores inesperados del repositorio', async () => {
    usuarioRepository.findOneByUsernameWithPass.mockRejectedValue(
      new Error('DB error'),
    );

    await expect(iniciarSesion.execute('frank', '123456')).rejects.toThrow(
      'DB error',
    );
  });
});
