import { ServicoProps } from "./servico.props";
import { StringValueObject } from "../../value-objects/shared/string/string.vo";
import { NumberValueObject } from "../../value-objects/shared/number/number.vo";
import { IntegerValueObject } from "../../value-objects/shared/integer/integer.vo";

export class Servico {
    private constructor(private readonly props: ServicoProps) {}

    public static criarServico(props: ServicoProps): Servico {
        return new Servico(props)
    }

    get id(): string | undefined {
        return this.props.id
    }

    get idPrestador(): string {
        return this.props.idPrestador.valor
    }
    set idPrestador(idPrestador: string) {
        this.props.idPrestador = new StringValueObject('idPrestador', idPrestador)
    }

    get idCategoria(): string {
        return this.props.idCategoria.valor
    }
    set idCategoria(idCategoria: string) {
        this.props.idCategoria = new StringValueObject('idCategoria', idCategoria)
    }

    get titulo(): string {
        return this.props.titulo.valor
    }
    set titulo(titulo: string) {
        this.props.titulo = new StringValueObject('titulo', titulo, 3, 80)
    }

    get descricao(): string | undefined {
        return this.props.descricao?.valor
    }
    set descricao(descricao: string) {
        this.props.descricao = new StringValueObject('descricao', descricao, 5, 500)
    }

    get precoMin(): number | undefined {
        return this.props.precoMin?.valor
    }
    set precoMin(precoMin: number) {
        this.props.precoMin = new NumberValueObject('precoMin', precoMin, 1)
    }

    get precoMax(): number | undefined {
        return this.props.precoMax?.valor
    }
    set precoMax(precoMax: number) {
        this.props.precoMax = new NumberValueObject('precoMax', precoMax, 1)
    }

    get prazoMedioHoras(): number | undefined {
        return this.props.prazoMedioHoras?.valor
    }
    set prazoMedioHoras(prazoMedioHoras: number) {
        this.props.prazoMedioHoras = new IntegerValueObject('prazoMedioHoras', prazoMedioHoras, 1)
    }
}
