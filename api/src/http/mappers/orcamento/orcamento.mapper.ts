import { Orcamento } from "../../../domain/entities/orcamento/orcamento.entity";
import { OrcamentoRespostaDTO } from "../../dto/orcamento/orcamento-resposta.dto";

export class OrcamentoMapper {
    public static paraRespostaDTO(orcamento: Orcamento): OrcamentoRespostaDTO {
        return {
            id: orcamento.id,
            idSolicitacao: orcamento.idSolicitacao,
            idPrestador: orcamento.idPrestador,
            valor: orcamento.valor,
            prazoDias: orcamento.prazoDias,
            status: orcamento.status,
            dataCriacao: orcamento.dataCriacao,
            dataAceite: orcamento.dataAceite
        }
    }

    public static paraListaRespostaDTO(orcamentos: Orcamento[]): OrcamentoRespostaDTO[] {
        return orcamentos.map(OrcamentoMapper.paraRespostaDTO)
    }
}
