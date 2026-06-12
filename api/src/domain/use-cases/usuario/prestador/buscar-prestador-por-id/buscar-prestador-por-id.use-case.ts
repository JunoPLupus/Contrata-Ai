import { IPrestadorRepository } from "../../../../repositories/prestador.repository";
import { Prestador } from "../../../../entities/prestador/prestador.entity";
import { RecursoNaoEncontradoError } from "../../../../errors/recurso-nao-encontrado.error";

export class BuscarPrestadorPorIdUseCase {
    constructor(private readonly prestadorRepository: IPrestadorRepository) {}

    /**
     * Busca um prestador pelo `id`.
     * @param id - `id` do prestador a ser pesquisado.
     * @returns O prestador encontrado.
     * @throws {RecursoNaoEncontradoError} se não existir prestador com esse `id`.
     */
    async execute(id: string): Promise<Prestador> {
        const prestadorEncontrado = await this.prestadorRepository.buscarPorId(id)

        if (prestadorEncontrado == null) throw new RecursoNaoEncontradoError('Prestador')

        return prestadorEncontrado
    }
}
