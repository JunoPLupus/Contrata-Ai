import { ServicoProps } from "./servico.props";
import { StringValueObject } from "../../value-objects/shared/string/string.vo";
import { NumberValueObject } from "../../value-objects/shared/number/number.vo";

export class Servico {
    private constructor(private readonly props: ServicoProps) {}

    public static criarServico(props: ServicoProps): Servico {
        return new Servico(props);
    }

    get id(): string | undefined {
        return this.props.id;
    }

    get idPrestador(): string {
        return this.props.idPrestador.valor;
    }
    set idPrestador(idPrestador: string) {
        this.props.idPrestador = new StringValueObject('idPrestador', idPrestador);
    }

    get idCategoria(): string {
        return this.props.idCategoria.valor;
    }
    set idCategoria(idCategoria: string) {
        this.props.idCategoria = new StringValueObject('idCategoria', idCategoria);
    }

    get descricao(): string {
        return this.props.descricao.valor;
    }
    set descricao(descricao: string) {
        this.props.descricao = new StringValueObject('descricao', descricao, 5, 500);
    }

    get precoMin(): number | undefined {
        return this.props.precoMin?.valor;
    }
    set precoMin(precoMin: number) {
        this.props.precoMin = new NumberValueObject('precoMin', precoMin, 1);
    }

    get precoMax(): number | undefined {
        return this.props.precoMax?.valor;
    }
    set precoMax(precoMax: number) {
        this.props.precoMax = new NumberValueObject('precoMax', precoMax, 1);
    }

    get prazoMedioDias(): number | undefined {
        return this.props.prazoMedioDias?.valor;
    }
    set prazoMedioDias(prazoMedioDias: number) {
        this.props.prazoMedioDias = new NumberValueObject('prazoMedio', prazoMedioDias, 1);
    }
}
