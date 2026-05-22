import { Servico } from "../entities/servico/servico.entity";

export abstract class IServicoRepository {
    /**
     * Busca um servico pelo identificador unico.
     * @param id - ID do servico a ser pesquisado.
     * @returns O servico encontrado, ou `null` se nao existir registro com esse ID.
     */
    abstract buscarPorId(id: string): Promise<Servico | null>;

    /**
     * Busca todos os servicos cadastrados por um prestador.
     * @param idPrestador - ID do prestador cujos servicos serao listados.
     * @returns Lista de servicos do prestador. Retorna array vazio se nenhum for encontrado.
     */
    abstract buscarPorIdPrestador(idPrestador: string): Promise<Servico[]>;

    /**
     * Persiste um novo servico.
     * @param servico - Entidade de dominio a ser inserida.
     * @returns O servico inserido com o `id` preenchido pelo banco.
     */
    abstract inserir(servico: Servico): Promise<Servico>;
}
