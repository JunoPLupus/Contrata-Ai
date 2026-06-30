import { IServicoRepository } from "../../../repositories/servico.repository";
import { IPrestadorRepository } from "../../../repositories/prestador.repository";
import { Servico } from "../../../entities/servico/servico.entity";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";

export class BuscarServicosDoPrestadorUseCase {
    constructor(
        private readonly servicoRepository: IServicoRepository,
        private readonly prestadorRepository: IPrestadorRepository
    ) {}

    /**
     * Retorna os serviços públicos de um prestador (RF08/UC08).
     * Valida que o prestador existe antes de buscar os serviços.
     *
     * @param idPrestador - ID do prestador cujos serviços serão retornados.
     * @returns Lista de serviços do prestador.
     * @throws {RecursoNaoEncontradoError} se o prestador não existir.
     */
    async execute(idPrestador: string): Promise<Servico[]> {
        const prestador = await this.prestadorRepository.buscarPorId(idPrestador)
        if (!prestador) {
            throw new RecursoNaoEncontradoError('Prestador')
        }

        return this.servicoRepository.buscarPorIdPrestador(idPrestador)
    }
}
