import { ExtensaoPrazo } from "../entities/extensao-prazo/extensao-prazo.entity";

export abstract class IExtensaoPrazoRepository {
    /**
     * Busca uma extensão de prazo pelo identificador único.
     * @param id - ID da extensão a ser pesquisada.
     * @returns A extensão encontrada, ou `null` se não existir registro com esse ID.
     */
    abstract buscarPorId(id: string): Promise<ExtensaoPrazo | null>

    /**
     * Persiste uma nova extensão de prazo.
     * @param extensao - Entidade de domínio a ser inserida.
     * @returns A extensão inserida com o `id` preenchido pelo banco.
     */
    abstract inserir(extensao: ExtensaoPrazo): Promise<ExtensaoPrazo>

    /**
     * Atualiza os dados de uma extensão de prazo existente.
     * @param extensao - Entidade com os dados atualizados (deve conter `id` válido).
     * @returns A extensão atualizada.
     */
    abstract atualizar(extensao: ExtensaoPrazo): Promise<ExtensaoPrazo>
}
