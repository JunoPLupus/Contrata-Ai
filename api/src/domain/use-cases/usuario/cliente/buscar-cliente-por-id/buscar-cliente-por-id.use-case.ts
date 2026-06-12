import { IUsuarioRepository } from "../../../../repositories/usuario.repository";
import { Usuario } from "../../../../entities/usuario/usuario.entity";
import { RecursoNaoEncontradoError } from "../../../../errors/recurso-nao-encontrado.error";

export class BuscarClientePorIdUseCase {
    constructor(private readonly usuarioRepository: IUsuarioRepository) {}

    /**
     * Busca um cliente pelo `id`.
     * @param id - `id` do cliente a ser pesquisado.
     * @returns O cliente encontrado.
     * @throws {RecursoNaoEncontradoError} se não existir cliente com esse `id`.
     */
    async execute(id: string): Promise<Usuario> {
        const usuarioEncontrado = await this.usuarioRepository.buscarPorId(id)

        if (usuarioEncontrado == null) throw new RecursoNaoEncontradoError('Cliente')

        return usuarioEncontrado
    }
}
