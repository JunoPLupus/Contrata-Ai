import { Contrato } from "../../../entities/contrato/contrato.entity";
import { IContratoRepository } from "../../../repositories/contrato.repository";

export class BuscarContratosDoUsuarioUseCase {
    constructor(private readonly contratoRepository: IContratoRepository) {}

    /**
     * Retorna todos os contratos nos quais o usuário está envolvido
     * (como cliente ou como prestador).
     *
     * @param idCliente - ID do usuário autenticado (sempre presente no token).
     * @param idPrestador - ID do prestador vinculado ao usuário (pode ser `undefined`).
     * @returns Lista unificada de contratos do usuário, sem duplicatas.
     */
    async execute(idCliente: string, idPrestador?: string): Promise<Contrato[]> {
        const comoCliente = await this.contratoRepository.buscarPorIdCliente(idCliente)

        if (!idPrestador) return comoCliente

        const comoPrestador = await this.contratoRepository.buscarPorIdPrestador(idPrestador)

        const ids = new Set(comoCliente.map(c => c.id))
        const unificados = [...comoCliente, ...comoPrestador.filter(c => !ids.has(c.id))]

        return unificados
    }
}
