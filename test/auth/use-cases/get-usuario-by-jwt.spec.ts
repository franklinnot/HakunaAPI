/* eslint-disable @typescript-eslint/unbound-method */
import { GetUsuarioByJWT } from 'src/modules/auth/application/use-cases/get-usuario-by-jwt';
import { AuthUtils } from 'src/modules/auth/application/auth.utils';
import { UsuariosUtils } from 'src/modules/usuarios/application/usuarios.utils';
import type { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import type { IUsuarioResponse } from 'src/modules/usuarios/application/usuarios.responses';
import { Estado } from 'src/shared/domain/enums';

describe('GetUsuarioByJWT', () => {
  let getUsuarioByJWT: GetUsuarioByJWT;
  let usuariosUtils: jest.Mocked<UsuariosUtils>;
  let authUtils: jest.Mocked<AuthUtils>;

  beforeEach(() => {
    usuariosUtils = {
      getUsuarioResponse: jest.fn(),
    } as unknown as jest.Mocked<UsuariosUtils>;

    authUtils = {
      generarJWT: jest.fn(),
    } as unknown as jest.Mocked<AuthUtils>;

    getUsuarioByJWT = new GetUsuarioByJWT(usuariosUtils, authUtils);
  });

  // ----------------------------------------------------------------
  // TEST 1: Obtener usuario y generar token exitosamente
  // ----------------------------------------------------------------
  it('debe generar token y retornar datos del usuario', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u123',
      username: 'frank',
      nombre: 'Frank',
      password: 'hashedPassword',
      id_foto: 'foto123',
      estado: Estado.HABILITADO,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    const mockUsuarioResponse: IUsuarioResponse = {
      id_usuario: 'u123',
      username: 'frank',
      nombre: 'Frank',
      link_foto: 'https://example.com/foto.png',
      createdAt: new Date('2024-01-01'),
    };

    usuariosUtils.getUsuarioResponse.mockResolvedValue(mockUsuarioResponse);
    authUtils.generarJWT.mockReturnValue('jwt-token-mock');

    const result = await getUsuarioByJWT.execute(mockUsuario);

    expect(result.success).toBe(true);
    expect(result.data?.usuario).toEqual(mockUsuarioResponse);
    expect(result.data?.token).toBe('jwt-token-mock');
    expect(usuariosUtils.getUsuarioResponse).toHaveBeenCalledWith(mockUsuario);
    expect(authUtils.generarJWT).toHaveBeenCalledWith('u123', 'frank');
  });

  // ----------------------------------------------------------------
  // TEST 2: Generar token con usuario sin foto
  // ----------------------------------------------------------------
  it('debe generar token correctamente cuando el usuario no tiene foto', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u456',
      username: 'ana',
      nombre: 'Ana',
      password: 'hashedPassword',
      id_foto: null,
      estado: Estado.HABILITADO,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    const mockUsuarioResponse: IUsuarioResponse = {
      id_usuario: 'u456',
      username: 'ana',
      nombre: 'Ana',
      link_foto: '',
      createdAt: new Date('2024-01-01'),
    };

    usuariosUtils.getUsuarioResponse.mockResolvedValue(mockUsuarioResponse);
    authUtils.generarJWT.mockReturnValue('jwt-token-ana');

    const result = await getUsuarioByJWT.execute(mockUsuario);

    expect(result.success).toBe(true);
    expect(result.data?.usuario).toEqual(mockUsuarioResponse);
    expect(result.data?.token).toBe('jwt-token-ana');
    expect(usuariosUtils.getUsuarioResponse).toHaveBeenCalledWith(mockUsuario);
    expect(authUtils.generarJWT).toHaveBeenCalledWith('u456', 'ana');
  });

  // ----------------------------------------------------------------
  // TEST 3: Fallo al obtener usuario response
  // ----------------------------------------------------------------
  it('debe propagar error si getUsuarioResponse falla', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u789',
      username: 'carlos',
      nombre: 'Carlos',
      password: 'hashedPassword',
      id_foto: 'foto789',
      estado: Estado.HABILITADO,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    usuariosUtils.getUsuarioResponse.mockRejectedValue(
      new Error('Error al obtener datos del usuario'),
    );

    await expect(getUsuarioByJWT.execute(mockUsuario)).rejects.toThrow(
      'Error al obtener datos del usuario',
    );
    expect(authUtils.generarJWT).toHaveBeenCalledWith('u789', 'carlos');
  });

  // ----------------------------------------------------------------
  // TEST 4: Fallo inesperado al generar JWT
  // ----------------------------------------------------------------
  it('debe propagar error si generarJWT falla', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u999',
      username: 'maria',
      nombre: 'Maria',
      password: 'hashedPassword',
      id_foto: null,
      estado: Estado.HABILITADO,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    authUtils.generarJWT.mockImplementation(() => {
      throw new Error('Error al generar JWT');
    });

    await expect(getUsuarioByJWT.execute(mockUsuario)).rejects.toThrow(
      'Error al generar JWT',
    );
  });
});
