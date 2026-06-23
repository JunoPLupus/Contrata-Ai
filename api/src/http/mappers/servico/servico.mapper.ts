import { Servico } from "../../../domain/entities/servico/servico.entity";
import { ServicoRespostaDTO } from "../../dto/servico/servico-resposta.dto";

export class ServicoMapper {
    public static paraRespostaDTO(servico: Servico): ServicoRespostaDTO {
        return {
            id: servico.id,
            idCategoria: servico.idCategoria,
            descricao: servico.descricao,
            precoMin: servico.precoMin,
            precoMax: servico.precoMax,
            prazoMedioDias: servico.prazoMedioDias
        };
    }

    public static paraListaRespostaDTO(servicos: Servico[]): ServicoRespostaDTO[] {
        return servicos.map(ServicoMapper.paraRespostaDTO);
    }
}
