import { IPrestadorRepository } from "../../../../repositories/prestador.repository";
import { RecursoNaoEncontradoError } from "../../../../errors/recurso-nao-encontrado.error";

export class InativarPrestadorUseCase {
    constructor(private readonly prestadorRepository: IPrestadorRepository) {}

    /**
     * Torna o perfil de um prestador inativo permanentemente.
     * @param id - `id` do prestador a ser inativado.
     * @throws {RecursoNaoEncontradoError} se não existir prestador com esse `id`.
     */
    async execute(id: string): Promise<void> {
        const prestador = await this.prestadorRepository.buscarPorId(id)

        if (prestador == null) throw new RecursoNaoEncontradoError('Prestador')

        await this.prestadorRepository.inativar(id)
    }
}
