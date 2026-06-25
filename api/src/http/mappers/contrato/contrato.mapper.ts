import { Contrato } from "../../../domain/entities/contrato/contrato.entity";
import { ContratoRespostaDTO } from "../../dto/contrato/contrato-resposta.dto";
import { ContratoComWhatsapp } from "../../../domain/use-cases/contrato/buscar-contrato-por-id/buscar-contrato-por-id.use-case";

export class ContratoMapper {
    public static paraRespostaDTO(contrato: Contrato & { whatsappPrestador?: string }): ContratoRespostaDTO {
        return {
            id: contrato.id,
            idSolicitacao: contrato.idSolicitacao,
            idOrcamento: contrato.idOrcamento,
            idCliente: contrato.idCliente,
            idPrestador: contrato.idPrestador,
            status: contrato.status,
            dataAceite: contrato.dataAceite,
            dataInicioEstimada: contrato.dataInicioEstimada,
            prazoEstimado: contrato.prazoEstimado,
            dataConclusao: contrato.dataConclusao,
            cienciaPagamento: contrato.cienciaPagamento,
            whatsappLiberado: contrato.whatsappLiberado,
            motivoCancelamento: contrato.motivoCancelamento,
            canceladoPor: contrato.canceladoPor,
            whatsappPrestador: (contrato as ContratoComWhatsapp).whatsappPrestador,
        }
    }

    public static paraListaRespostaDTO(contratos: Contrato[]): ContratoRespostaDTO[] {
        return contratos.map(c => ContratoMapper.paraRespostaDTO(c))
    }
}
