import { IBaseRepository } from 'src/shared/infraestructure/repository/base.repository.interface';
import { IArchivo } from '../domain/archivos.entities';

export interface IArchivoRepository extends IBaseRepository<IArchivo> {
  findLinkById(id_archivo: string): Promise<string | null>;
}
