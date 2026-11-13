import { IAvaliacaoRepository } from "../../../repositories/avaliacao.repository";
import { Papel } from "../../../value-objects/shared/papel/papel.vo";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { ResumoAvaliacoes, resumirAvaliacoes } from "../resumo-avaliacoes";

export class BuscarAvaliacoesDoClienteUseCase {
    constructor(private readonly avaliacaoRepository: IAvaliacaoRepository) {}

    /**
     * Busca as avaliações **recebidas** por um cliente (escritas pelos prestadores) com a média
     * e total calculados — a reputação do cliente. As avaliações que ele escreveu não entram.
     *
     * Regras de acesso:
     * - Prestadores logados podem ver (decidir se vale orçar).
     * - O próprio cliente pode ver a sua reputação.
     * - Outros clientes não podem ver a reputação de um cliente.
     *
     * @param idCliente - ID do cliente cuja reputação será consultada.
     * @param idClienteLogado - ID do perfil de cliente do usuário logado (do token).
     * @param idPrestadorLogado - ID do perfil de prestador do usuário logado (do token), se houver.
     * @returns Objeto com `avaliacoes`, `media` e `total`.
     * @throws {AcessoProibidoError} Se o usuário logado não for prestador nem o próprio cliente.
     */
    async execute(idCliente: string, idClienteLogado: string, idPrestadorLogado?: string): Promise<ResumoAvaliacoes> {
        const ehOProprioCliente = idClienteLogado === idCliente
        if (!idPrestadorLogado && !ehOProprioCliente) throw new AcessoProibidoError()

        const avaliacoes = await this.avaliacaoRepository.buscarPorIdCliente(idCliente, Papel.PRESTADOR)

        return resumirAvaliacoes(avaliacoes)
    }
}
