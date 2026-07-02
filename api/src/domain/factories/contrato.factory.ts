import { Contrato } from "../entities/contrato/contrato.entity";
import { StringValueObject } from "../value-objects/shared/string/string.vo";
import { StatusContratoValueObject, StatusContrato, StatusContratoTipo } from "../value-objects/contrato/status/status.vo";
import { TipoProblemaValueObject, TipoProblemaTipo } from "../value-objects/contrato/problema/tipo-problema.vo";

export class ContratoFactory {
    public static criar(dados: {
        id?: string
        idSolicitacao: string
        idOrcamento: string
        idCliente: string
        idPrestador: string
        status?: StatusContratoTipo
        dataAceite: Date
        dataInicioEstimada?: Date
        prazoEstimado?: Date
        dataConclusao?: Date
        cienciaPagamento?: boolean
        whatsappLiberado?: boolean
        motivoCancelamento?: string
        canceladoPor?: string
        problema?: { tipo: string; descricao: string; dataCriacao?: Date }
    }): Contrato {
        return Contrato.criarContrato({
            id: dados.id,
            idSolicitacao: new StringValueObject('idSolicitação', dados.idSolicitacao),
            idOrcamento: new StringValueObject('idOrcamento', dados.idOrcamento),
            idCliente: new StringValueObject('idCliente', dados.idCliente),
            idPrestador: new StringValueObject('idPrestador', dados.idPrestador),
            status: new StatusContratoValueObject(dados.status ?? StatusContrato.AGUARDANDO_INICIO),
            dataAceite: dados.dataAceite,
            dataInicioEstimada: dados.dataInicioEstimada,
            prazoEstimado: dados.prazoEstimado,
            dataConclusao: dados.dataConclusao,
            cienciaPagamento: dados.cienciaPagamento ?? false,
            whatsappLiberado: dados.whatsappLiberado ?? false,
            motivoCancelamento: dados.motivoCancelamento,
            canceladoPor: dados.canceladoPor,
            problema: dados.problema
                ? {
                    tipo: new TipoProblemaValueObject(dados.problema.tipo as TipoProblemaTipo),
                    descricao: new StringValueObject('descrição', dados.problema.descricao, 10),
                    dataCriacao: dados.problema.dataCriacao ?? new Date(),
                }
                : undefined,
        })
    }
}
