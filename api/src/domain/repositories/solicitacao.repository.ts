import { Solicitacao } from "../entities/solicitacao/solicitacao.entity";

export abstract class ISolicitacaoRepository {
    /**
     * Busca uma solicitação pelo identificador único.
     * @param id - ID da solicitação a ser pesquisada.
     * @returns A solicitação encontrada, ou `null` se não existir registro com esse ID.
     */
    abstract buscarPorId(id: string): Promise<Solicitacao | null>

    /**
     * Busca todas as solicitações de um cliente.
     * @param idCliente - ID do cliente cujas solicitações serão listadas.
     * @returns Lista de solicitações do cliente. Retorna array vazio se nenhuma for encontrada.
     */
    abstract buscarPorIdCliente(idCliente: string): Promise<Solicitacao[]>

    /**
     * Busca solicitações abertas visíveis ao prestador, filtradas por categorias.
     * Retorna solicitações gerais (id_prestador_direto = null) e diretas endereçadas ao prestador.
     * @param idPrestador - ID do prestador autenticado.
     * @param idsCategorias - Categorias dos serviços do prestador (usado como filtro).
     * @param idCategoria - Categoria específica para filtrar (opcional).
     * @returns Lista de solicitações disponíveis. Retorna array vazio se nenhuma for encontrada.
     */
    abstract buscarDisponiveisParaPrestador(
        idPrestador: string,
        idsCategorias: string[],
        idCategoria?: string
    ): Promise<Solicitacao[]>

    /**
     * Persiste uma nova solicitação.
     * @param solicitacao - Entidade de domínio a ser inserida.
     * @returns A solicitação inserida com o `id` preenchido pelo banco.
     */
    abstract inserir(solicitacao: Solicitacao): Promise<Solicitacao>

    /**
     * Atualiza os dados de uma solicitação existente.
     * @param solicitacao - Entidade com os dados atualizados (deve conter `id` válido).
     * @returns A solicitação atualizada.
     */
    abstract atualizar(solicitacao: Solicitacao): Promise<Solicitacao>
}
