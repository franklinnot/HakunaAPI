/* eslint-disable @typescript-eslint/unbound-method */
import { UpdateUsuario } from 'src/modules/usuarios/application/use-cases/update-usuario/update-usuario';
import type { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import type { IArchivoRepository } from 'src/modules/archivos/infraestructure/repositories.interfaces';
import { UpdateFotoPerfil } from 'src/modules/usuarios/application/use-cases/update-usuario/update-foto-perfil';
import { Estado } from 'src/shared/domain/enums';
import { UsuariosMapper } from 'src/modules/usuarios/application/usuarios.mapper';
import type { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';

jest.mock('src/modules/usuarios/application/usuarios.mapper', () => ({
  UsuariosMapper: {
    toUsuarioResponse: jest.fn(),
  },
}));

describe('UpdateUsuario', () => {
  let updateUsuario: UpdateUsuario;
  let usuarioRepository: jest.Mocked<IUsuarioRepository>;
  let archivoRepository: jest.Mocked<IArchivoRepository>;
  let updateFotoPerfilCU: jest.Mocked<UpdateFotoPerfil>;

  const mockUsuario: IUsuario = {
    _id: 'u123',
    nombre: 'Frank',
    username: 'frank',
    password: 'hashed',
    id_foto: 'f123',
    estado: Estado.HABILITADO,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    usuarioRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IUsuarioRepository>;

    archivoRepository = {
      findLinkById: jest.fn(),
    } as unknown as jest.Mocked<IArchivoRepository>;

    updateFotoPerfilCU = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateFotoPerfil>;

    updateUsuario = new UpdateUsuario(
      usuarioRepository,
      archivoRepository,
      updateFotoPerfilCU,
    );
  });

  // ------------------------------------------------------------
  // TEST 1: Username ya existe
  // ------------------------------------------------------------
  it('debe retornar error si el nuevo username ya está en uso por otro usuario', async () => {
    usuarioRepository.findOne.mockResolvedValue({
      _id: 'otro123',
      username: 'nuevo',
    } as IUsuario);

    const result = await updateUsuario.execute(
      mockUsuario,
      undefined,
      'nuevo',
      undefined,
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('El usuario ya existe.');
    expect(usuarioRepository.update).not.toHaveBeenCalled();
  });

  // ------------------------------------------------------------
  // TEST 2: Actualizar con nueva foto
  // ------------------------------------------------------------
  it('debe actualizar correctamente el usuario cuando se cambia la foto', async () => {
    usuarioRepository.findOne.mockResolvedValue(null);
    updateFotoPerfilCU.execute.mockResolvedValue('nuevo-link-foto.png');

    const updatedUser = { ...mockUsuario, nombre: 'Franklin' };
    usuarioRepository.update.mockResolvedValue(updatedUser as IUsuario);

    (UsuariosMapper.toUsuarioResponse as jest.Mock).mockReturnValue({
      id_usuario: 'u123',
      nombre: 'Franklin',
      username: 'frank',
      link_foto: 'nuevo-link-foto.png',
    });

    const result = await updateUsuario.execute(
      mockUsuario,
      'Franklin',
      undefined,
      'nueva-foto.png',
    );

    expect(result.success).toBe(true);
    expect(updateFotoPerfilCU.execute).toHaveBeenCalledWith(
      'u123',
      'nueva-foto.png',
    );
    expect(usuarioRepository.update).toHaveBeenCalledWith('u123', {
      nombre: 'Franklin',
      username: 'frank',
    });
    expect(result.data?.link_foto).toBe('nuevo-link-foto.png');
  });

  // ------------------------------------------------------------
  // TEST 3: Actualizar sin cambiar foto (usa la actual)
  // ------------------------------------------------------------
  it('debe obtener el link actual si no se cambia la foto', async () => {
    usuarioRepository.findOne.mockResolvedValue(null);
    archivoRepository.findLinkById.mockResolvedValue('foto-vieja.png');
    usuarioRepository.update.mockResolvedValue(mockUsuario);
    (UsuariosMapper.toUsuarioResponse as jest.Mock).mockReturnValue({
      id_usuario: 'u123',
      nombre: 'Frank',
      username: 'frank',
      link_foto: 'foto-vieja.png',
    });

    const result = await updateUsuario.execute(mockUsuario, 'Frank', undefined);

    expect(result.success).toBe(true);
    expect(archivoRepository.findLinkById).toHaveBeenCalledWith('f123');
    expect(updateFotoPerfilCU.execute).not.toHaveBeenCalled();
    expect(result.data?.link_foto).toBe('foto-vieja.png');
  });

  // ------------------------------------------------------------
  // TEST 4: Error en update (usuario no se actualiza)
  // ------------------------------------------------------------
  it('debe retornar error si update no devuelve un usuario', async () => {
    usuarioRepository.findOne.mockResolvedValue(null);
    archivoRepository.findLinkById.mockResolvedValue('foto-vieja.png');
    usuarioRepository.update.mockResolvedValue(null);

    const result = await updateUsuario.execute(mockUsuario, 'Frank2', 'franko');

    expect(result.success).toBe(false);
    expect(result.error).toBe('No se pudo actualizar el usuario.');
  });

  // ------------------------------------------------------------
  // TEST 5: Error inesperado (throw interno)
  // ------------------------------------------------------------
  it('debe propagar errores inesperados', async () => {
    usuarioRepository.findOne.mockRejectedValue(new Error('DB fail'));

    await expect(
      updateUsuario.execute(mockUsuario, 'Frank', 'nuevo'),
    ).rejects.toThrow('DB fail');
  });
});
