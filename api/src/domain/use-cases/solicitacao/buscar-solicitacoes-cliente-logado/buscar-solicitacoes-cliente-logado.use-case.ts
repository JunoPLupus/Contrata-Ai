import { Solicitacao } from "../../../entities/solicitacao/solicitacao.entity";
import { ISolicitacaoRepository } from "../../../repositories/solicitacao.repository";

export class BuscarSolicitacoesClienteLogadoUseCase {
    constructor(private readonly solicitacaoRepository: ISolicitacaoRepository) {}

    /**
     * Retorna todas as solicitações do cliente autenticado.
     * @param idCliente - ID do cliente extraído do token JWT.
     * @returns Lista de solicitações do cliente. Retorna array vazio se nenhuma for encontrada.
     */
    async execute(idCliente: string): Promise<Solicitacao[]> {
        return this.solicitacaoRepository.buscarPorIdCliente(idCliente)
    }
}
