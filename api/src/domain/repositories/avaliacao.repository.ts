import { Avaliacao } from "../entities/avaliacao/avaliacao.entity";
import { PapelTipo } from "../value-objects/shared/papel/papel.vo";

export abstract class IAvaliacaoRepository {
    /**
     * Busca uma avaliação pelo identificador único.
     * @param id - ID da avaliação a ser pesquisada.
     * @returns A avaliação encontrada, ou `null` se não existir registro com esse ID.
     */
    abstract buscarPorId(id: string): Promise<Avaliacao | null>

    /**
     * Busca a avaliação de um contrato específico.
     * Garante a regra de 1 avaliação por contrato (retorna no máximo 1).
     * @param idContrato - ID do contrato.
     * @returns A avaliação do contrato, ou `null` se ainda não foi avaliado.
     */
    abstract buscarPorIdContrato(idContrato: string): Promise<Avaliacao | null>

    /**
     * Busca as avaliações de contratos de um cliente, na direção informada.
     * @param idCliente - ID do cliente do contrato.
     * @param autor - `'cliente'` = avaliações **feitas** pelo cliente; `'prestador'` = **recebidas** por ele.
     * @returns Lista de avaliações. Retorna array vazio se nenhuma for encontrada.
     */
    abstract buscarPorIdCliente(idCliente: string, autor: PapelTipo): Promise<Avaliacao[]>

    /**
     * Busca as avaliações de contratos de um prestador, na direção informada.
     * @param idPrestador - ID do prestador do contrato.
     * @param autor - `'cliente'` = avaliações **recebidas** pelo prestador; `'prestador'` = **feitas** por ele.
     * @returns Lista de avaliações. Retorna array vazio se nenhuma for encontrada.
     */
    abstract buscarPorIdPrestador(idPrestador: string, autor: PapelTipo): Promise<Avaliacao[]>

    /**
     * Persiste uma nova avaliação.
     * @param avaliacao - Entidade de domínio a ser inserida.
     * @returns A avaliação inserida com o `id` preenchido pelo banco.
     */
    abstract inserir(avaliacao: Avaliacao): Promise<Avaliacao>

    /**
     * Atualiza os dados de uma avaliação existente.
     * @param avaliacao - Entidade com os dados atualizados (deve conter `id` válido).
     * @returns A avaliação atualizada.
     */
    abstract atualizar(avaliacao: Avaliacao): Promise<Avaliacao>

    /**
     * Remove permanentemente uma avaliação (hard delete).
     * @param id - ID da avaliação a ser removida.
     */
    abstract deletar(id: string): Promise<void>
}
