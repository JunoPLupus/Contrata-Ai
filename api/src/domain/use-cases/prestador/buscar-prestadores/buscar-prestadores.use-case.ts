import { IPrestadorRepository } from "../../../repositories/prestador.repository";
import { PrestadorBuscaResultado } from "../../../dto/prestador/prestador-busca-resultado.dto";

export class BuscarPrestadoresUseCase {
    constructor(private readonly prestadorRepository: IPrestadorRepository) {}

    /**
     * Busca prestadores ativos por categoria de serviço e/ou nome (match parcial).
     * Ambos os filtros são opcionais e combináveis.
     * Sem nenhum filtro, retorna todos os prestadores ativos.
     *
     * @param filtros - `idCategoria` e/ou `nomePrestador` (ambos opcionais).
     * @returns Lista de projeções de prestador; lista vazia se nada casar.
     */
    async execute(filtros: { idCategoria?: string; nomePrestador?: string }): Promise<PrestadorBuscaResultado[]> {
        return this.prestadorRepository.buscar(filtros)
    }
}
