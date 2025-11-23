/* eslint-disable @typescript-eslint/unbound-method */
import { DisableUsuario } from 'src/modules/usuarios/application/use-cases/disable-usuario';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import type { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import { Estado } from 'src/shared/domain/enums';

describe('DisableUsuario', () => {
  let disableUsuario: DisableUsuario;
  let usuarioRepository: jest.Mocked<IUsuarioRepository>;

  beforeEach(() => {
    usuarioRepository = {
      disable: jest.fn(),
    } as unknown as jest.Mocked<IUsuarioRepository>;

    disableUsuario = new DisableUsuario(usuarioRepository);
  });

  // ----------------------------------------------------------------
  // TEST 1: Deshabilitar usuario exitosamente
  // ----------------------------------------------------------------
  it('debe deshabilitar un usuario correctamente', async () => {
    const mockUsuario: IUsuario = {
      _id: 'u123',
      username: 'frank',
      nombre: 'Frank',
      password: 'hashedPassword',
      id_foto: 'foto123',
      estado: Estado.DESHABILITADO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    usuarioRepository.disable.mockResolvedValue(mockUsuario);

    const result = await disableUsuario.execute('u123');

    expect(result.success).toBe(true);
    expect(result.data).toBe(true);
    expect(usuarioRepository.disable).toHaveBeenCalledWith('u123');
  });

  // ----------------------------------------------------------------
  // TEST 2: Usuario no encontrado (no se puede deshabilitar)
  // ----------------------------------------------------------------
  it('debe retornar error cuando el usuario no existe', async () => {
    usuarioRepository.disable.mockResolvedValue(null);

    const result = await disableUsuario.execute('u999');

    expect(result.success).toBe(false);
    expect(result.error).toBe('No se pudo deshabilitar el usuario.');
    expect(usuarioRepository.disable).toHaveBeenCalledWith('u999');
  });

  // ----------------------------------------------------------------
  // TEST 3: Error inesperado del repositorio
  // ----------------------------------------------------------------
  it('debe propagar errores inesperados del repositorio', async () => {
    usuarioRepository.disable.mockRejectedValue(new Error('DB error'));

    await expect(disableUsuario.execute('u456')).rejects.toThrow('DB error');
    expect(usuarioRepository.disable).toHaveBeenCalledWith('u456');
  });
});
