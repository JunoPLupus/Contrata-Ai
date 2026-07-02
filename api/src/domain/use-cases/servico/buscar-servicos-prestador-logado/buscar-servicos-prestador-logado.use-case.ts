import { Servico } from "../../../entities/servico/servico.entity";
import { IServicoRepository } from "../../../repositories/servico.repository";

export class BuscarServicosPrestadorLogadoUseCase {
    constructor(private readonly servicoRepository: IServicoRepository) {}

    /**
     * Retorna todos os servicos cadastrados pelo prestador logado.
     * @param idPrestador - ID do prestador autenticado extraido do token JWT.
     * @returns Lista de servicos do prestador. Retorna array vazio se nenhum for encontrado.
     */
    async execute(idPrestador: string): Promise<Servico[]> {
        return this.servicoRepository.buscarPorIdPrestador(idPrestador)
    }
}
