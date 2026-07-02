import { IPrestadorRepository } from "../../../repositories/prestador.repository";
import { PrestadorBuscaResultado } from "../../../dto/prestador/prestador-busca-resultado.dto";
import { CampoObrigatorioVazioError } from "../../../errors/campo-obrigatorio-vazio.error";

export class BuscarPrestadoresPorCidadeUseCase {
    constructor(private readonly prestadorRepository: IPrestadorRepository) {}

    /**
     * Busca prestadores ativos cuja cidade corresponde à informada (RF07).
     * Comparação case-insensitive e match exato.
     *
     * @param cidade - Nome da cidade a filtrar. Obrigatório.
     * @returns Lista de projeções de prestador; lista vazia se nada casar.
     * @throws {CampoObrigatorioVazioError} se `cidade` for vazia ou não informada.
     */
    async execute(cidade: string | undefined): Promise<PrestadorBuscaResultado[]> {
        if (!cidade || cidade.trim() === '') {
            throw new CampoObrigatorioVazioError('cidade')
        }

        return this.prestadorRepository.buscarPorCidade(cidade.trim())
    }
}
