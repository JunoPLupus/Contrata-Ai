import { Orcamento } from "../entities/orcamento/orcamento.entity";

export abstract class IOrcamentoRepository {
    /**
     * Busca um orçamento pelo identificador único.
     * @param id - ID do orçamento a ser pesquisado.
     * @returns O orçamento encontrado, ou `null` se não existir registro com esse ID.
     */
    abstract buscarPorId(id: string): Promise<Orcamento | null>

    /**
     * Busca todos os orçamentos de um prestador.
     * @param idPrestador - ID do prestador cujos orçamentos serão listados.
     * @returns Lista de orçamentos do prestador. Retorna array vazio se nenhum for encontrado.
     */
    abstract buscarPorIdPrestador(idPrestador: string): Promise<Orcamento[]>

    /**
     * Busca todos os orçamentos vinculados a uma solicitação.
     * Utilizado na cascata de aceite (encerrar demais pendentes) e na futura rota
     * `GET /solicitacoes/:id/orcamentos`.
     * @param idSolicitacao - ID da solicitação.
     * @returns Lista de orçamentos da solicitação. Retorna array vazio se nenhum for encontrado.
     */
    abstract buscarPorIdSolicitacao(idSolicitacao: string): Promise<Orcamento[]>

    /**
     * Persiste um novo orçamento.
     * @param orcamento - Entidade de domínio a ser inserida.
     * @returns O orçamento inserido com o `id` preenchido pelo banco.
     * @throws Erro Mongo 11000 se já existir orçamento com o mesmo par `(idSolicitacao, idPrestador)`.
     */
    abstract inserir(orcamento: Orcamento): Promise<Orcamento>

    /**
     * Atualiza os dados de um orçamento existente.
     * @param orcamento - Entidade com os dados atualizados (deve conter `id` válido).
     * @returns O orçamento atualizado.
     */
    abstract atualizar(orcamento: Orcamento): Promise<Orcamento>
}
