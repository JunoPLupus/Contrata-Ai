import { Prestador } from "../../entities/prestador/prestador.entity";

export type AtualizarPrestadorDTO = Partial<Pick<Prestador, 'telefone' | 'descricao'>>
