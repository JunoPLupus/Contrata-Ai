import { Solicitacao } from "../../../entities/solicitacao/solicitacao.entity";
import { ISolicitacaoRepository } from "../../../repositories/solicitacao.repository";
import { IServicoRepository } from "../../../repositories/servico.repository";

export class BuscarSolicitacoesDisponiveisPrestadorUseCase {
    constructor(
        private readonly solicitacaoRepository: ISolicitacaoRepository,
        private readonly servicoRepository: IServicoRepository
    ) {}

    /**
     * Retorna as solicitações abertas visíveis ao prestador autenticado.
     * Inclui solicitações gerais (sem prestador direto) e diretas endereçadas a ele,
     * nas categorias dos serviços que o prestador oferece.
     * @param idPrestador - ID do prestador autenticado extraído do token JWT.
     * @param idCategoria - Categoria específica para filtrar (opcional).
     * @returns Lista de solicitações disponíveis. Retorna array vazio se nenhuma for encontrada.
     */
    async execute(idPrestador: string, idCategoria?: string): Promise<Solicitacao[]> {
        const servicos = await this.servicoRepository.buscarPorIdPrestador(idPrestador)
        const idsCategorias = [...new Set(servicos.map(s => s.idCategoria))]

        return this.solicitacaoRepository.buscarDisponiveisParaPrestador(idPrestador, idsCategorias, idCategoria)
    }
}
