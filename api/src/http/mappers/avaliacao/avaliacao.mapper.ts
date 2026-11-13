import { Avaliacao } from "../../../domain/entities/avaliacao/avaliacao.entity";
import { AvaliacaoRespostaDTO } from "../../dto/avaliacao/avaliacao-resposta.dto";
import { AvaliacaoPublicaRespostaDTO } from "../../dto/avaliacao/avaliacao-publica-resposta.dto";
import { AvaliacoesDoPrestadorRespostaDTO } from "../../dto/avaliacao/avaliacoes-do-prestador-resposta.dto";
import { AvaliacoesDoPrestadorResultado } from "../../../domain/use-cases/avaliacao/buscar-avaliacoes-do-prestador/buscar-avaliacoes-do-prestador.use-case";
import { Papel } from "../../../domain/value-objects/shared/papel/papel.vo";

export class AvaliacaoMapper {
    /**
     * Visão completa — usada para o autor da avaliação.
     * Expõe `idCliente` e `idPrestador` independente do campo `anonima`.
     */
    public static paraRespostaDTO(avaliacao: Avaliacao): AvaliacaoRespostaDTO {
        return {
            id: avaliacao.id,
            idContrato: avaliacao.idContrato,
            idCliente: avaliacao.idCliente,
            idPrestador: avaliacao.idPrestador,
            autor: avaliacao.autor,
            nota: avaliacao.nota,
            comentario: avaliacao.comentario,
            anonima: avaliacao.anonima,
            dataCriacao: avaliacao.dataCriacao,
            dataAtualizacao: avaliacao.dataAtualizacao,
        }
    }

    /**
     * Visão pública — quando `anonima === true`, oculta o id do **autor** (RN08): `idCliente`
     * se quem escreveu foi o cliente, `idPrestador` se foi o prestador. O avaliado continua visível.
     * Usada nas rotas públicas: `GET /avaliacoes/:id` e `GET /contratos/:idContrato/avaliacoes`.
     */
    public static paraRespostaPublicaDTO(avaliacao: Avaliacao): AvaliacaoPublicaRespostaDTO {
        return {
            id: avaliacao.id,
            idContrato: avaliacao.idContrato,
            idCliente: avaliacao.anonima && avaliacao.autor === Papel.CLIENTE ? undefined : avaliacao.idCliente,
            idPrestador: avaliacao.anonima && avaliacao.autor === Papel.PRESTADOR ? undefined : avaliacao.idPrestador,
            autor: avaliacao.autor,
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
