import { Solicitacao } from "../../../entities/solicitacao/solicitacao.entity";
import { ISolicitacaoRepository } from "../../../repositories/solicitacao.repository";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

export class BuscarSolicitacaoPorIdUseCase {
    constructor(
        private readonly solicitacaoRepository: ISolicitacaoRepository,
        private readonly servicoRepository: IServicoRepository
    ) {}

    /**
     * Busca uma solicitação pelo ID, aplicando regras de permissão por ator.
     * - Cliente dono: pode ver sua própria solicitação.
     * - Prestador: pode ver se for uma solicitação direta a ele, ou se a categoria
     *   da solicitação estiver entre as categorias dos serviços que oferece.
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
            const categoriasDoPrestador = servicos.map(s => s.idCategoria)

            if (categoriasDoPrestador.includes(solicitacao.idCategoria)) return solicitacao
        }

        throw new AcessoProibidoError()
    }
}
