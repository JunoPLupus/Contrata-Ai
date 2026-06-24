import { Solicitacao } from "../../../domain/entities/solicitacao/solicitacao.entity";
import { SolicitacaoRespostaDTO } from "../../dto/solicitacao/solicitacao-resposta.dto";

export class SolicitacaoMapper {
    public static paraRespostaDTO(solicitacao: Solicitacao): SolicitacaoRespostaDTO {
        return {
            id: solicitacao.id,
            idCliente: solicitacao.idCliente,
            idCategoria: solicitacao.idCategoria,
            idPrestadorDireto: solicitacao.idPrestadorDireto,
            descricao: solicitacao.descricao,
            status: solicitacao.status,
            dataSolicitacao: solicitacao.dataSolicitacao
        }
    }

    public static paraListaRespostaDTO(solicitacoes: Solicitacao[]): SolicitacaoRespostaDTO[] {
        return solicitacoes.map(SolicitacaoMapper.paraRespostaDTO)
    }
}
