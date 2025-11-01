/* eslint-disable @typescript-eslint/unbound-method */
import { GetUsuariosPorNombreOUsername } from 'src/modules/usuarios/application/use-cases/get-users-by-name-or-username';
import { UsuariosUtils } from 'src/modules/usuarios/application/usuarios.utils';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';
import { IUsuarioRepository } from 'src/modules/usuarios/infraestructure/usuarios.repositories.interfaces';
import { Estado } from 'src/shared/domain/enums';

describe('GetUsuariosPorNombreOUsername', () => {
  let getUsuariosPorNombreOUsername: GetUsuariosPorNombreOUsername;

  let usuarioRepository: jest.Mocked<IUsuarioRepository>;
  let usuariosUtils: jest.Mocked<UsuariosUtils>;

  beforeEach(() => {
    usuarioRepository = {
      findAll: jest.fn(),
    } as unknown as jest.Mocked<IUsuarioRepository>;

    usuariosUtils = {
      getUsuarioResponse: jest.fn(),
    } as unknown as jest.Mocked<UsuariosUtils>;

    getUsuariosPorNombreOUsername = new GetUsuariosPorNombreOUsername(
      usuarioRepository,
      usuariosUtils,
    );
  });

  // ---------------------------------------------------
  // TEST: Usuarios encontrados
  // ---------------------------------------------------
  it('debería devolver usuarios filtrados correctamente', async () => {
    const id_usuario = '123';
    const palabra = 'fran';

    const mockUsuarios = [
      {
        _id: '123',
        nombre: 'Frank',
        username: 'frankito',
        estado: Estado.HABILITADO,
      },
      {
        _id: '456',
        nombre: 'Franco',
        username: 'fco',
        estado: Estado.HABILITADO,
      },
      {
        _id: '789',
        nombre: 'Luis',
        username: 'lucho',
        estado: Estado.HABILITADO,
      },
    ];

    usuarioRepository.findAll.mockResolvedValue(mockUsuarios as IUsuario[]);

    usuariosUtils.getUsuarioResponse.mockImplementation((u: IUsuario) =>
      Promise.resolve({
        id_usuario: u._id,
        nombre: u.nombre,
        username: u.username,
        link_foto: 'some-link',
        createdAt: new Date(),
      }),
    );

    const result = await getUsuariosPorNombreOUsername.execute(
      id_usuario,
      palabra,
    );

    expect(usuarioRepository.findAll).toHaveBeenCalledWith({
      estado: Estado.HABILITADO,
    });
    expect(usuariosUtils.getUsuarioResponse).toHaveBeenCalledTimes(1); // Solo Franco coincide
    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      // IUsuarioResponse
      {
        id_usuario: '456',
        nombre: 'Franco',
        username: 'fco',
        link_foto: 'some-link',
        createdAt: expect.any(Date) as Date,
      },
    ]);
  });

  // ---------------------------------------------------
  // TEST: Sin coincidencias
  // ---------------------------------------------------
  it('debería devolver arreglo vacío si no hay coincidencias', async () => {
    usuarioRepository.findAll.mockResolvedValue([
      {
        _id: '1',
        nombre: 'Carlos',
        username: 'charly',
        estado: Estado.HABILITADO,
        id_foto: null,
        password: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await getUsuariosPorNombreOUsername.execute('1', 'pepe');

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
    expect(usuariosUtils.getUsuarioResponse).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------
  // TEST: Sin usuarios habilitados
  // ---------------------------------------------------
  it('debería devolver arreglo vacío si no hay usuarios habilitados', async () => {
    usuarioRepository.findAll.mockResolvedValue([]);

    const result = await getUsuariosPorNombreOUsername.execute('1', 'algo');

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
    expect(usuariosUtils.getUsuarioResponse).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------
  // TEST: Coincidencias por username
  // ---------------------------------------------------
  it('debería coincidir también por username', async () => {
    const mockUsuarios = [
      {
        _id: '1',
        nombre: 'Pepe',
        username: 'juanito',
        estado: Estado.HABILITADO,
      },
      {
        _id: '2',
        nombre: 'Juan',
        username: 'pepito',
        estado: Estado.HABILITADO,
      },
    ];

    usuarioRepository.findAll.mockResolvedValue(mockUsuarios as IUsuario[]);

    usuariosUtils.getUsuarioResponse.mockResolvedValue({
      id_usuario: '2',
      nombre: 'Juan',
      username: 'pepito',
      link_foto: 'some-link',
      createdAt: new Date(),
    });

    const result = await getUsuariosPorNombreOUsername.execute('1', 'pep');

    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      // Adjusted expected data to match IUsuarioResponse structure
      {
        id_usuario: '2',
        nombre: 'Juan',
        username: 'pepito',
        link_foto: 'some-link',
        createdAt: expect.any(Date) as Date,
      },
    ]);
  });
});
