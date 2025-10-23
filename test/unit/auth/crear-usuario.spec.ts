/* eslint-disable @typescript-eslint/unbound-method */
import { CrearUsuario } from 'src/modules/auth/application/use-cases/crear-usuario';
import { AuthUtils } from 'src/modules/auth/application/auth.utils';
import type { IUsuariosService } from 'src/modules/usuarios/application/usuarios.service.interface';
import type { IUsuarioResponse } from 'src/modules/usuarios/application/usuarios.responses';

describe('CrearUsuario', () => {
  let crearUsuario: CrearUsuario;
  let usuariosService: jest.Mocked<IUsuariosService>;
  let authUtils: jest.Mocked<AuthUtils>;

  beforeEach(() => {
    usuariosService = {
      createUsuario: jest.fn(),
    } as unknown as jest.Mocked<IUsuariosService>;

    authUtils = {
      generarJWT: jest.fn(),
    } as unknown as jest.Mocked<AuthUtils>;

    crearUsuario = new CrearUsuario(usuariosService, authUtils);
  });

  // ----------------------------------------------------------------
  // TEST 1: Crear usuario exitosamente
  // ----------------------------------------------------------------
  it('debe crear un usuario y retornar token', async () => {
    const mockUsuario: IUsuarioResponse = {
      id_usuario: 'u123',
      username: 'frank',
      nombre: 'Frank',
      link_foto: 'foto.png',
      createdAt: new Date(),
    };

    usuariosService.createUsuario.mockResolvedValue({
      success: true,
      data: mockUsuario,
    });

    authUtils.generarJWT.mockReturnValue('jwt-token-mock');

    const result = await crearUsuario.execute(
      'Frank',
      'frank',
      '123456',
      'foto.png',
    );

    expect(result.success).toBe(true);
    expect(result.data?.usuario).toEqual(mockUsuario);
    expect(result.data?.token).toBe('jwt-token-mock');
    expect(usuariosService.createUsuario).toHaveBeenCalledWith(
      'Frank',
      'frank',
      '123456',
      'foto.png',
    );
    expect(authUtils.generarJWT).toHaveBeenCalledWith('u123', 'frank');
  });

  // ----------------------------------------------------------------
  // TEST 2: Fallo al crear usuario (respuesta sin éxito)
  // ----------------------------------------------------------------
  it('debe retornar error si createUsuario falla', async () => {
    usuariosService.createUsuario.mockResolvedValue({
      success: false,
      data: null,
      error: 'Username ya existe',
    });

    const result = await crearUsuario.execute(
      'Frank',
      'frank',
      '123456',
      'foto.png',
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Username ya existe');
    expect(authUtils.generarJWT).not.toHaveBeenCalled();
  });

  // ----------------------------------------------------------------
  // TEST 3: Fallo inesperado (por ejemplo, excepción en createUsuario)
  // ----------------------------------------------------------------
  it('debe propagar errores inesperados', async () => {
    usuariosService.createUsuario.mockRejectedValue(new Error('DB error'));

    await expect(
      crearUsuario.execute('Frank', 'frank', '123456'),
    ).rejects.toThrow('DB error');
  });
});
