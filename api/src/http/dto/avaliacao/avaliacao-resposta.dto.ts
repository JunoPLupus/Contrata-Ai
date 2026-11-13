import { Avaliacao } from "../../../domain/entities/avaliacao/avaliacao.entity";

export type AvaliacaoRespostaDTO = Pick<
    Avaliacao,
    | 'id'
    | 'idContrato'
    | 'idCliente'
    | 'idPrestador'
    | 'autor'
    | 'nota'
    | 'comentario'
    | 'anonima'
    | 'dataCriacao'
    | 'dataAtualizacao'
>
