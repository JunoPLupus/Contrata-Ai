import { Servico } from "../../../domain/entities/servico/servico.entity";
import { ServicoRespostaDTO } from "../../dto/servico/servico-resposta.dto";

export class ServicoMapper {
    public static paraRespostaDTO(servico: Servico): ServicoRespostaDTO {
        return {
            id: servico.id,
            idCategoria: servico.idCategoria,
            titulo: servico.titulo,
            descricao: servico.descricao,
            precoMin: servico.precoMin,
            precoMax: servico.precoMax,
            prazoMedioHoras: servico.prazoMedioHoras,
            atendimentoDomiciliar: servico.atendimentoDomiciliar,
            ativo: servico.ativo
        };
    }

    public static paraListaRespostaDTO(servicos: Servico[]): ServicoRespostaDTO[] {
        return servicos.map(ServicoMapper.paraRespostaDTO);
    }
}
