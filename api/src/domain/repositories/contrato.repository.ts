import { Contrato } from "../entities/contrato/contrato.entity";

export abstract class IContratoRepository {
    /**
     * Busca um contrato pelo identificador único.
     * @param id - ID do contrato a ser pesquisado.
     * @returns O contrato encontrado, ou `null` se não existir registro com esse ID.
     */
    abstract buscarPorId(id: string): Promise<Contrato | null>

    /**
     * Busca todos os contratos de um cliente.
     * @param idCliente - ID do usuário cliente.
     * @returns Lista de contratos do cliente. Retorna array vazio se nenhum for encontrado.
     */
    abstract buscarPorIdCliente(idCliente: string): Promise<Contrato[]>

    /**
     * Busca todos os contratos de um prestador.
     * @param idPrestador - ID do prestador.
     * @returns Lista de contratos do prestador. Retorna array vazio se nenhum for encontrado.
     */
    abstract buscarPorIdPrestador(idPrestador: string): Promise<Contrato[]>

    /**
     * Persiste um novo contrato.
     * @param contrato - Entidade de domínio a ser inserida.
     * @returns O contrato inserido com o `id` preenchido pelo banco.
     */
    abstract inserir(contrato: Contrato): Promise<Contrato>

    /**
     * Atualiza os dados de um contrato existente.
     * @param contrato - Entidade com os dados atualizados (deve conter `id` válido).
     * @returns O contrato atualizado.
     */
    abstract atualizar(contrato: Contrato): Promise<Contrato>
}
