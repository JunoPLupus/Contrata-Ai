import { ContratoProps } from "./contrato.props";
import { StatusContratoValueObject, StatusContrato, StatusContratoTipo } from "../../value-objects/contrato/status/status.vo";
import { TipoProblemaValueObject, TipoProblemaTipo } from "../../value-objects/contrato/problema/tipo-problema.vo";
import { StringValueObject } from "../../value-objects/shared/string/string.vo";

export class Contrato {
    private constructor(private readonly props: ContratoProps) {}

    public static criarContrato(props: ContratoProps): Contrato {
        return new Contrato(props)
    }

    get id(): string | undefined {
        return this.props.id
    }

    get idSolicitacao(): string {
        return this.props.idSolicitacao.valor
    }

    get idOrcamento(): string {
        return this.props.idOrcamento.valor
    }

    get idCliente(): string {
        return this.props.idCliente.valor
    }

    get idPrestador(): string {
        return this.props.idPrestador.valor
    }

    get status(): StatusContratoTipo {
        return this.props.status.valor
    }
    set status(status: StatusContratoTipo) {
        this.props.status = new StatusContratoValueObject(status)
    }

    get dataAceite(): Date {
        return this.props.dataAceite
    }

    get dataInicioEstimada(): Date | undefined {
        return this.props.dataInicioEstimada
    }
    set dataInicioEstimada(data: Date | undefined) {
        this.props.dataInicioEstimada = data
    }

    get prazoEstimado(): Date | undefined {
        return this.props.prazoEstimado
    }
    set prazoEstimado(prazo: Date | undefined) {
        this.props.prazoEstimado = prazo
    }

    get dataConclusao(): Date | undefined {
        return this.props.dataConclusao
    }

    get cienciaPagamento(): boolean {
        return this.props.cienciaPagamento
    }

    get whatsappLiberado(): boolean {
        return this.props.whatsappLiberado
    }

    get motivoCancelamento(): string | undefined {
        return this.props.motivoCancelamento
    }

    get canceladoPor(): string | undefined {
        return this.props.canceladoPor
    }

    get problema(): { tipo: TipoProblemaTipo; descricao: string; dataCriacao: Date } | undefined {
        if (!this.props.problema) return undefined
        return {
            tipo: this.props.problema.tipo.valor,
            descricao: this.props.problema.descricao.valor,
            dataCriacao: this.props.problema.dataCriacao,
        }
    }

    /**
     * Conclui o contrato, preenchendo o status e a data de conclusão atomicamente.
     * Encapsula o invariante: `dataConclusao` só existe quando `status === 'concluido'`.
     */
    public concluir(): void {
        this.props.status = new StatusContratoValueObject(StatusContrato.CONCLUIDO)
        this.props.dataConclusao = new Date()
    }

    /**
     * Cancela o contrato, registrando o motivo e o responsável pelo cancelamento.
     *
     * @param motivo - Descrição textual do motivo do cancelamento.
     * @param idResponsavel - ID do usuário que efetuou o cancelamento (para auditoria e flag de reputação).
     */
    public cancelar(motivo: string, idResponsavel: string): void {
        this.props.status = new StatusContratoValueObject(StatusContrato.CANCELADO)
        this.props.motivoCancelamento = motivo
        this.props.canceladoPor = idResponsavel
    }

    /**
     * Verifica se o cancelamento ocorre dentro do prazo contratual.
     * Utilizado para decidir se a flag de reputação deve ser incrementada (RN04).
     *
     * A data-limite é `prazoEstimado`; caso não esteja definida,
     * usa `dataAceite + 15 dias` como fallback.
     *
     * @returns `true` se o cancelamento for dentro do prazo; `false` se estiver em atraso.
     */
    public estaDentroDoPrazo(): boolean {
        const agora = new Date()
        const prazo = this.props.prazoEstimado ?? new Date(this.props.dataAceite.getTime() + 15 * 24 * 60 * 60 * 1000)
        return agora <= prazo
    }

    /**
     * Registra um problema no contrato (RF24).
     * A validação de status permitido fica no use-case, espelhando o padrão de `cancelar()`.
     *
     * @param tipo - Tipo do problema (deve ser um valor de `TipoProblema`).
     * @param descricao - Descrição detalhada do problema (mínimo 10 caracteres).
     */
    public relatarProblema(tipo: string, descricao: string): void {
        this.props.problema = {
            tipo: new TipoProblemaValueObject(tipo),
            descricao: new StringValueObject('descrição', descricao, 10),
            dataCriacao: new Date(),
        }
    }
}
