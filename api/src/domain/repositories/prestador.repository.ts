import { Prestador } from "../entities/prestador/prestador.entity";
import { PrestadorBuscaResultado } from "../dto/prestador/prestador-busca-resultado.dto";

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

    /**
     * Busca prestadores ativos por categoria de serviço e/ou nome (match parcial).
     * Junta dados de `usuarios` (nome, cidade) e `servicos` (categoria).
     * @param filtros - Filtros opcionais: `idCategoria` e/ou `nomePrestador`.
     * @returns Projeção de leitura; lista vazia se nada casar.
     */
    abstract buscar(filtros: { idCategoria?: string; nomePrestador?: string }): Promise<PrestadorBuscaResultado[]>;

    /**
     * Busca prestadores ativos cujo usuário tem `localizacao_cidade` igual à cidade informada.
     * Comparação case-insensitive.
     * @param cidade - Nome da cidade a filtrar.
     * @returns Projeção de leitura; lista vazia se nada casar.
     */
    abstract buscarPorCidade(cidade: string): Promise<PrestadorBuscaResultado[]>;
}
