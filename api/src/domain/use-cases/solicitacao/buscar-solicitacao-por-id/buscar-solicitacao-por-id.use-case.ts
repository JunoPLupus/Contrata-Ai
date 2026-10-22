import { Solicitacao } from "../../../entities/solicitacao/solicitacao.entity";
import { ISolicitacaoRepository } from "../../../repositories/solicitacao.repository";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { IOrcamentoRepository } from "../../../repositories/orcamento.repository";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

export class BuscarSolicitacaoPorIdUseCase {
    constructor(
        private readonly solicitacaoRepository: ISolicitacaoRepository,
        private readonly servicoRepository: IServicoRepository,
        private readonly orcamentoRepository: IOrcamentoRepository
    ) {}

    /**
     * Busca uma solicitação pelo ID, aplicando regras de permissão por ator.
     * - Cliente dono: pode ver sua própria solicitação.
     * - Prestador: pode ver se for uma solicitação direta a ele, se a categoria
     *   da solicitação estiver entre as categorias dos serviços que oferta (pausados
     *   não contam), ou se ele já enviou orçamento para ela (mesmo com o serviço pausado).
     * @param id - ID da solicitação.
     * @param idCliente - ID do cliente autenticado (do JWT).
     * @param idPrestador - ID do prestador autenticado (do JWT), se o ator for prestador.
     * @returns A solicitação encontrada.
     * @throws {RecursoNaoEncontradoError} Se a solicitação não existir.
     * @throws {AcessoProibidoError} Se o ator não tiver permissão para ver a solicitação.
     */
    async execute(id: string, idCliente: string, idPrestador?: string): Promise<Solicitacao> {
        const solicitacao = await this.solicitacaoRepository.buscarPorId(id)
        if (!solicitacao) throw new RecursoNaoEncontradoError('Solicitação')

        if (solicitacao.idCliente === idCliente) return solicitacao

        if (idPrestador !== undefined) {
            if (solicitacao.idPrestadorDireto === idPrestador) return solicitacao

            const servicos = await this.servicoRepository.buscarPorIdPrestador(idPrestador)
            const categoriasDoPrestador = servicos.filter(s => s.estaOfertado()).map(s => s.idCategoria)

            if (categoriasDoPrestador.includes(solicitacao.idCategoria)) return solicitacao

            const orcamentos = await this.orcamentoRepository.buscarPorIdSolicitacao(id)
            if (orcamentos.some(o => o.idPrestador === idPrestador)) return solicitacao
        }

        throw new AcessoProibidoError()
    }
}
