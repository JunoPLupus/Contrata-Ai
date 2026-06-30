import { Avaliacao } from "../../../domain/entities/avaliacao/avaliacao.entity";
import { AvaliacaoRespostaDTO } from "../../dto/avaliacao/avaliacao-resposta.dto";
import { AvaliacaoPublicaRespostaDTO } from "../../dto/avaliacao/avaliacao-publica-resposta.dto";
import { AvaliacoesDoPrestadorRespostaDTO } from "../../dto/avaliacao/avaliacoes-do-prestador-resposta.dto";
import { AvaliacoesDoPrestadorResultado } from "../../../domain/use-cases/avaliacao/buscar-avaliacoes-do-prestador/buscar-avaliacoes-do-prestador.use-case";

export class AvaliacaoMapper {
    /**
     * Visão completa — usada para o cliente logado (autor da avaliação).
     * Expõe `idCliente` independente do campo `anonima`.
     */
    public static paraRespostaDTO(avaliacao: Avaliacao): AvaliacaoRespostaDTO {
        return {
            id: avaliacao.id,
            idContrato: avaliacao.idContrato,
            idCliente: avaliacao.idCliente,
            idPrestador: avaliacao.idPrestador,
            nota: avaliacao.nota,
            comentario: avaliacao.comentario,
            anonima: avaliacao.anonima,
            dataCriacao: avaliacao.dataCriacao,
            dataAtualizacao: avaliacao.dataAtualizacao,
        }
    }

    /**
     * Visão pública — oculta `idCliente` quando `anonima === true` (RN08).
     * Usada nas rotas públicas: `GET /avaliacoes/:id` e `GET /contratos/:idContrato/avaliacao`.
     */
    public static paraRespostaPublicaDTO(avaliacao: Avaliacao): AvaliacaoPublicaRespostaDTO {
        return {
            id: avaliacao.id,
            idContrato: avaliacao.idContrato,
            idCliente: avaliacao.anonima ? undefined : avaliacao.idCliente,
            idPrestador: avaliacao.idPrestador,
            nota: avaliacao.nota,
            comentario: avaliacao.comentario,
            anonima: avaliacao.anonima,
            dataCriacao: avaliacao.dataCriacao,
            dataAtualizacao: avaliacao.dataAtualizacao,
        }
    }

    public static paraListaRespostaDTO(avaliacoes: Avaliacao[]): AvaliacaoRespostaDTO[] {
        return avaliacoes.map(a => AvaliacaoMapper.paraRespostaDTO(a))
    }

    public static paraListaRespostaPublicaDTO(avaliacoes: Avaliacao[]): AvaliacaoPublicaRespostaDTO[] {
        return avaliacoes.map(a => AvaliacaoMapper.paraRespostaPublicaDTO(a))
    }

    /**
     * Visão do prestador — retorna `{ avaliacoes, media, total }` (RF08).
     * A lista de avaliações usa a visão pública (respeita anonimato).
     */
    public static paraRespostaDoPrestadorDTO(resultado: AvaliacoesDoPrestadorResultado): AvaliacoesDoPrestadorRespostaDTO {
        return {
            avaliacoes: AvaliacaoMapper.paraListaRespostaPublicaDTO(resultado.avaliacoes),
            media: resultado.media,
            total: resultado.total,
        }
    }
}
