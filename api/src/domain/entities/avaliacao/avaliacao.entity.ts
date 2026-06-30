import { AvaliacaoProps } from "./avaliacao.props";
import { NumberValueObject } from "../../value-objects/shared/number/number.vo";
import { StringValueObject } from "../../value-objects/shared/string/string.vo";

const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000

export class Avaliacao {
    private constructor(private readonly props: AvaliacaoProps) {}

    public static criarAvaliacao(props: AvaliacaoProps): Avaliacao {
        return new Avaliacao(props)
    }

    get id(): string | undefined {
        return this.props.id
    }

    get idContrato(): string {
        return this.props.idContrato.valor
    }

    get idCliente(): string {
        return this.props.idCliente.valor
    }

    get idPrestador(): string {
        return this.props.idPrestador.valor
    }

    get nota(): number {
        return this.props.nota.valor
    }

    get comentario(): string | undefined {
        return this.props.comentario?.valor
    }

    get anonima(): boolean {
        return this.props.anonima
    }

    get dataCriacao(): Date {
        return this.props.dataCriacao
    }

    get dataAtualizacao(): Date | undefined {
        return this.props.dataAtualizacao
    }

    /**
     * Aplica atualizações parciais nos campos permitidos da avaliação.
     * Apenas os campos informados são alterados; os demais permanecem inalterados.
     * Seta `dataAtualizacao` com a data/hora atual após qualquer alteração.
     *
     * @param dados - Objeto com os campos a atualizar (`nota`, `comentario`, `anonima`).
     */
    public atualizar(dados: { nota?: number; comentario?: string; anonima?: boolean }): void {
        if (dados.nota !== undefined) {
            this.props.nota = new NumberValueObject('nota', dados.nota, 1, 5)
        }
        if (dados.comentario !== undefined) {
            this.props.comentario = new StringValueObject('comentário', dados.comentario)
        }
        if (dados.anonima !== undefined) {
            this.props.anonima = dados.anonima
        }
        this.props.dataAtualizacao = new Date()
    }

    /**
     * Verifica se a avaliação ainda pode ser alterada ou excluída.
     * A janela de edição é de 7 dias a partir de `dataCriacao`.
     *
     * @returns `true` se ainda estiver dentro do prazo de 7 dias; `false` caso contrário.
     */
    public podeSerAlterada(): boolean {
        return Date.now() - this.props.dataCriacao.getTime() <= SETE_DIAS_MS
    }
}
