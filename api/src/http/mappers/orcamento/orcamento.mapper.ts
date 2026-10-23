import { Orcamento } from "../../../domain/entities/orcamento/orcamento.entity";
import { OrcamentoRespostaDTO } from "../../dto/orcamento/orcamento-resposta.dto";

export class OrcamentoMapper {
    public static paraRespostaDTO(orcamento: Orcamento): OrcamentoRespostaDTO {
        return {
            id: orcamento.id,
            idSolicitacao: orcamento.idSolicitacao,
            idPrestador: orcamento.idPrestador,
            valorEstimado: orcamento.valorEstimado,
            descricao: orcamento.descricao,
            prazoEstimadoHoras: orcamento.prazoEstimadoHoras,
            status: orcamento.status,
            dataCriacao: orcamento.dataCriacao,
            dataAceite: orcamento.dataAceite
        }
    }

    public static paraListaRespostaDTO(orcamentos: Orcamento[]): OrcamentoRespostaDTO[] {
        return orcamentos.map(OrcamentoMapper.paraRespostaDTO)
    }
}
