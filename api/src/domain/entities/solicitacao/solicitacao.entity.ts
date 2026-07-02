import { SolicitacaoProps } from "./solicitacao.props";
import { StringValueObject } from "../../value-objects/shared/string/string.vo";
import { StatusSolicitacaoValueObject, StatusSolicitacaoTipo } from "../../value-objects/solicitacao/status/status.vo";

export class Solicitacao {
    private constructor(private readonly props: SolicitacaoProps) {}

    public static criarSolicitacao(props: SolicitacaoProps): Solicitacao {
        return new Solicitacao(props)
    }

    get id(): string | undefined {
        return this.props.id
    }

    get idCliente(): string {
        return this.props.idCliente.valor
    }

    get idCategoria(): string {
        return this.props.idCategoria.valor
    }

    get idPrestadorDireto(): string | undefined {
        return this.props.idPrestadorDireto?.valor
    }

    get descricao(): string {
        return this.props.descricao.valor
    }
    set descricao(descricao: string) {
        this.props.descricao = new StringValueObject('descricao', descricao, 5, 300)
    }

    get status(): StatusSolicitacaoTipo {
        return this.props.status.valor
    }
    set status(status: StatusSolicitacaoTipo) {
        this.props.status = new StatusSolicitacaoValueObject(status)
    }

    get dataSolicitacao(): Date {
        return this.props.dataSolicitacao
    }
}
