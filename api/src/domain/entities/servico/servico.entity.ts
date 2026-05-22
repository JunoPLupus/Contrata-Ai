import { ServicoProps } from "./servico.props";
import { IdPrestadorValueObject } from "../../value-objects/prestador/idPrestador/id-prestador.vo";
import { IdCategoriaValueObject } from "../../value-objects/categoria/idCategoria/id-categoria.vo";
import { DescricaoValueObject } from "../../value-objects/servico/descricao/descricao.vo";
import { PrecoMinValueObject } from "../../value-objects/servico/precoMin/preco-min.vo";
import { PrecoMaxValueObject } from "../../value-objects/servico/precoMax/preco-max.vo";
import { PrazoMedioValueObject } from "../../value-objects/servico/prazoMedio/prazo-medio.vo";

export class Servico {
    private constructor(private readonly props: ServicoProps) {}

    public static criarServico(props: ServicoProps): Servico {
        return new Servico(props);
    }

    get id(): string | undefined {
        return this.props.id;
    }

    get idPrestador(): string {
        return this.props.idPrestador.idPrestador;
    }
    set idPrestador(idPrestador: string) {
        this.props.idPrestador = new IdPrestadorValueObject(idPrestador);
    }

    get idCategoria(): string {
        return this.props.idCategoria.idCategoria;
    }
    set idCategoria(idCategoria: string) {
        this.props.idCategoria = new IdCategoriaValueObject(idCategoria);
    }

    get descricao(): string {
        return this.props.descricao.descricao;
    }
    set descricao(descricao: string) {
        this.props.descricao = new DescricaoValueObject(descricao);
    }

    get precoMin(): number | undefined {
        return this.props.precoMin?.precoMin;
    }
    set precoMin(precoMin: number) {
        this.props.precoMin = new PrecoMinValueObject(precoMin);
    }

    get precoMax(): number | undefined {
        return this.props.precoMax?.precoMax;
    }
    set precoMax(precoMax: number) {
        this.props.precoMax = new PrecoMaxValueObject(precoMax);
    }

    get prazoMedioDias(): number | undefined {
        return this.props.prazoMedioDias?.prazoMedio;
    }
    set prazoMedioDias(prazoMedioDias: number) {
        this.props.prazoMedioDias = new PrazoMedioValueObject(prazoMedioDias);
    }

    get ativo(): boolean {
        return this.props.ativo;
    }
    set ativo(ativo: boolean) {
        this.props.ativo = ativo;
    }
}
