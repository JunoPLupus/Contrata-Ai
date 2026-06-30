import { Contrato } from "../../../entities/contrato/contrato.entity";
import { IContratoRepository } from "../../../repositories/contrato.repository";
import { ContratoFactory } from "../../../factories/contrato.factory";

export type CriarContratoDTO = {
    idSolicitacao: string
    idOrcamento: string
    idCliente: string
    idPrestador: string
    dataAceite: Date
    prazoEstimado?: Date
}

export class CriarContratoUseCase {
    constructor(private readonly contratoRepository: IContratoRepository) {}

    /**
     * Cria um novo contrato a partir dos dados do orçamento aceito.
     * Chamado em cascata pelo `AceitarOrcamentoUseCase` — ver ADR-013.
     *
     * Os campos `cienciaPagamento` e `whatsappLiberado` são definidos como `true`
     * na criação pois o aceite do orçamento já pressupõe ambas as condições (RF13/RF15).
     *
     * @param dados - Dados necessários para criar o contrato.
     * @returns O contrato recém-criado com status `'aguardando_inicio'`.
     */
    async execute(dados: CriarContratoDTO): Promise<Contrato> {
        const contrato = ContratoFactory.criar({
            idSolicitacao: dados.idSolicitacao,
            idOrcamento: dados.idOrcamento,
            idCliente: dados.idCliente,
            idPrestador: dados.idPrestador,
            dataAceite: dados.dataAceite,
            prazoEstimado: dados.prazoEstimado,
            cienciaPagamento: true,
            whatsappLiberado: true,
        })

        return this.contratoRepository.inserir(contrato)
    }
}
