import { Prestador } from "../entities/prestador/prestador.entity";

export abstract class IPrestadorRepository {
    /**
     * Persiste um novo prestador.
     * @param prestador - Entidade de domínio a ser inserida.
     * @returns O prestador inserido com o `id` preenchido pelo banco.
     */
    abstract inserir(prestador : Prestador) : Promise<Prestador>;

    /**
     * Busca um prestador pelo identificador único.
     * @param id - `id` do prestador a ser pesquisado.
     * @returns O prestador encontrado, ou `null` se não existir registro com esse `id`.
     */
    abstract buscarPorId(id : string) : Promise< Prestador | null >;

    /**
     * Persiste as alterações de um prestador existente.
     * @param prestador - Entidade de domínio com os dados atualizados.
     * @returns O prestador com os dados atualizados.
     */
    abstract atualizar(prestador : Prestador) : Promise< Prestador >;

    /**
     * Torna o perfil de um prestador inativo.
     * @param id - `id` do prestador a ser inativado.
     */
    abstract inativar(id : string) : Promise<void>;

    /**
     * Reativa o perfil de um prestador previamente inativado.
     * @param id - `id` do prestador a ser ativado.
     */
    abstract ativar(id : string) : Promise<void>;
}