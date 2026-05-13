import { PrestadorProps } from "./prestador.props";

export class Prestador {
    private constructor(private readonly props : PrestadorProps) {
    }

    public static criarPrestador(props: PrestadorProps) : Prestador {
        return new Prestador(props)
    }

    get id() : string | undefined {
        return this.props.id;
    }

    get idCliente() : string {
        return this.props.idCliente;
    }
}