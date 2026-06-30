import { OrcamentoProps } from "./orcamento.props";
import { NumberValueObject } from "../../value-objects/shared/number/number.vo";
import { StatusOrcamentoValueObject, StatusOrcamento, StatusOrcamentoTipo } from "../../value-objects/orcamento/status/status.vo";

export class Orcamento {
    private constructor(private readonly props: OrcamentoProps) {}

    public static criarOrcamento(props: OrcamentoProps): Orcamento {
        return new Orcamento(props)
    }

    get id(): string | undefined {
        return this.props.id
    }

    get idSolicitacao(): string {
        return this.props.idSolicitacao.valor
    }

    get idPrestador(): string {
        return this.props.idPrestador.valor
    }

    get valor(): number {
        return this.props.valor.valor
    }
    set valor(valor: number) {
        this.props.valor = new NumberValueObject('valor', valor, 1)
    }

    get prazoDias(): number {
        return this.props.prazoDias.valor
    }
    set prazoDias(prazoDias: number) {
        this.props.prazoDias = new NumberValueObject('prazoDias', prazoDias, 1)
    }

    get status(): StatusOrcamentoTipo {
        return this.props.status.valor
    }
    set status(status: StatusOrcamentoTipo) {
        this.props.status = new StatusOrcamentoValueObject(status)
    }

    get dataCriacao(): Date {
        return this.props.dataCriacao
    }

    get dataAceite(): Date | undefined {
        return this.props.dataAceite
    }

    /**
     * Marca o orçamento como aceito, preenchendo o status e a data de aceite atomicamente.
     * Encapsula o invariante: `dataAceite` só existe quando `status === 'aceito'`.
     *
     * @remarks Não atômico com as demais operações de cascata — ver ADR-013.
     */
    public marcarComoAceito(): void {
        this.props.status = new StatusOrcamentoValueObject(StatusOrcamento.ACEITO)
        this.props.dataAceite = new Date()
    }
}
