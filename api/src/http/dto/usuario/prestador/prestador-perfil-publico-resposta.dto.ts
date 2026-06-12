import { Prestador } from "../../../../domain/entities/prestador/prestador.entity";

export type PrestadorPerfilPublicoRespostaDTO = Pick<Prestador, 'id' | 'descricao'>
