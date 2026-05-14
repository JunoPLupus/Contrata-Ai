import { Prestador } from "../entities/prestador/prestador.entity";

export abstract class IPrestadorRepository {
    /**
     * Persiste um novo prestador.
     * @param prestador - Entidade de domínio a ser inserida.
     * @returns O prestador inserido com o `id` preenchido pelo banco.
     */
    abstract inserir(prestador : Prestador) : Promise<Prestador>;
}