import { IPrestadorRepository } from "../../../../repositories/prestador.repository";
import { RecursoNaoEncontradoError } from "../../../../errors/recurso-nao-encontrado.error";

export class AtivarPrestadorUseCase {
    constructor(private readonly prestadorRepository: IPrestadorRepository) {}

    /**
     * Reativa o perfil de um prestador previamente inativado.
     * @param id - `id` do prestador a ser ativado.
     * @throws {RecursoNaoEncontradoError} se não existir prestador com esse `id`.
     */
    async execute(id: string): Promise<void> {
        const prestador = await this.prestadorRepository.buscarPorId(id)

        if (prestador == null) throw new RecursoNaoEncontradoError('Prestador')

        await this.prestadorRepository.ativar(id)
    }
}
