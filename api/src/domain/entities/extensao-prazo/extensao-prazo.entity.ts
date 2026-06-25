import { ExtensaoPrazoProps } from "./extensao-prazo.props";
import { StatusExtensaoPrazoValueObject, StatusExtensaoPrazoTipo } from "../../value-objects/extensao-prazo/status/status.vo";

export class ExtensaoPrazo {
    private constructor(private readonly props: ExtensaoPrazoProps) {}

    public static criarExtensaoPrazo(props: ExtensaoPrazoProps): ExtensaoPrazo {
        return new ExtensaoPrazo(props)
    }

    get id(): string | undefined {
        return this.props.id
    }

    get idContrato(): string {
        return this.props.idContrato.valor
    }

    get novoPrazo(): Date {
        return this.props.novoPrazo
    }

    get justificativa(): string {
        return this.props.justificativa.valor
    }

    get status(): StatusExtensaoPrazoTipo {
        return this.props.status.valor
    }
    set status(status: StatusExtensaoPrazoTipo) {
        this.props.status = new StatusExtensaoPrazoValueObject(status)
    }

    get dataSolicitacao(): Date {
        return this.props.dataSolicitacao
    }

    get dataResposta(): Date | undefined {
        return this.props.dataResposta
    }
    set dataResposta(data: Date | undefined) {
        this.props.dataResposta = data
    }
}
