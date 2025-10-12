import { IBaseRepository } from 'src/shared/infraestructure/repository/base.repository.interface';
import { IUsuario } from 'src/modules/usuarios/domain/usuarios.entities';

export interface IUsuarioRepository extends IBaseRepository<IUsuario> {
  findOneByUsernameWithPass(username: string): Promise<IUsuario | null>;
}
