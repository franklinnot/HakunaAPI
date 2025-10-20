import { Inject, Injectable } from '@nestjs/common';
import type { IUsuarioRepository } from '../../infraestructure/usuarios.repositories.interfaces';
import { IRespuesta, crearRespuesta } from 'src/shared/application/response';
import { Estado } from 'src/shared/domain/enums';

@Injectable()
export class ExisteUsuarioPorUsername {
  constructor(
    @Inject('IUsuarioRepository')
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(username: string): Promise<IRespuesta<boolean>> {
    const existe = await this.usuarioRepository.exists({
      username: username,
      estado: Estado.HABILITADO,
    });

    return crearRespuesta({
      success: true,
      data: existe,
    });
  }
}
