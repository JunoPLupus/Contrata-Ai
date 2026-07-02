import { PrestadorProps } from "./prestador.props";
import { StringValueObject } from "../../value-objects/shared/string/string.vo";
import { TelefoneUsuarioValueObject } from "../../value-objects/usuario/telefone/telefone.vo";
import { isStringVazia } from "../../utils/value-objects.utils";

export class Prestador {
    private constructor(private readonly props : PrestadorProps) {
    }

    public static criarPrestador(props: PrestadorProps) : Prestador {
        return new Prestador(props)
    }

    get id() : string | undefined {
        return this.props.id
    }

    get idCliente() : string {
        return this.props.idCliente.valor
    }

    get telefone() : string | undefined {
        return this.props.telefone?.valor
    }
    set telefone(telefone : string | undefined) {
        this.props.telefone = !isStringVazia(telefone) ? new TelefoneUsuarioValueObject('telefone', telefone) : undefined
    }

    get descricao() : string | undefined {
        return this.props.descricao?.valor
    }
    set descricao(descricao : string | undefined) {
        this.props.descricao = !isStringVazia(descricao) ? new StringValueObject('descricao', descricao, 5, 500) : undefined
    }

    get ativo() : boolean {
        return this.props.ativo
    }
    set ativo(ativo : boolean) {
        this.props.ativo = ativo
    }
}
