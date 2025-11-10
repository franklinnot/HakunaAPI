/* eslint-disable @typescript-eslint/unbound-method */
import { ExisteUsuarioPorUsername } from 'src/modules/usuarios/application/use-cases/existe-usuario-por-username';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import { Estado } from 'src/shared/domain/enums';

describe('ExisteUsuarioPorUsername', () => {
  let existeUsuarioPorUsername: ExisteUsuarioPorUsername;
  let usuarioRepository: jest.Mocked<IUsuarioRepository>;

  beforeEach(() => {
    usuarioRepository = {
      exists: jest.fn(),
    } as unknown as jest.Mocked<IUsuarioRepository>;

    existeUsuarioPorUsername = new ExisteUsuarioPorUsername(usuarioRepository);
  });

  // ----------------------------------------------------------------
  // TEST 1: Usuario existe y está habilitado
  // ----------------------------------------------------------------
  it('debe retornar true cuando el usuario existe y está habilitado', async () => {
    usuarioRepository.exists.mockResolvedValue(true);

    const result = await existeUsuarioPorUsername.execute('frank');

    expect(result.success).toBe(true);
    expect(result.data).toBe(true);
    expect(usuarioRepository.exists).toHaveBeenCalledWith({
      username: 'frank',
      estado: Estado.HABILITADO,
    });
  });

  // ----------------------------------------------------------------
  // TEST 2: Usuario no existe
  // ----------------------------------------------------------------
  it('debe retornar false cuando el usuario no existe', async () => {
    usuarioRepository.exists.mockResolvedValue(false);

    const result = await existeUsuarioPorUsername.execute('noexiste');

    expect(result.success).toBe(true);
    expect(result.data).toBe(false);
    expect(usuarioRepository.exists).toHaveBeenCalledWith({
      username: 'noexiste',
      estado: Estado.HABILITADO,
    });
  });

  // ----------------------------------------------------------------
  // TEST 3: Usuario existe pero está deshabilitado (debe retornar false)
  // ----------------------------------------------------------------
  it('debe retornar false cuando el usuario existe pero está deshabilitado', async () => {
    usuarioRepository.exists.mockResolvedValue(false);

    const result = await existeUsuarioPorUsername.execute('deshabilitado');

    expect(result.success).toBe(true);
    expect(result.data).toBe(false);
    expect(usuarioRepository.exists).toHaveBeenCalledWith({
      username: 'deshabilitado',
      estado: Estado.HABILITADO,
    });
  });

  // ----------------------------------------------------------------
  // TEST 4: Error inesperado del repositorio
  // ----------------------------------------------------------------
  it('debe propagar errores inesperados del repositorio', async () => {
    usuarioRepository.exists.mockRejectedValue(new Error('DB error'));

    await expect(existeUsuarioPorUsername.execute('frank')).rejects.toThrow(
      'DB error',
    );
    expect(usuarioRepository.exists).toHaveBeenCalledWith({
      username: 'frank',
      estado: Estado.HABILITADO,
    });
  });
});