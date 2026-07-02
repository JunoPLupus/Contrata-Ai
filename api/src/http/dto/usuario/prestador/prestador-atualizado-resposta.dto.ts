import { Prestador } from "../../../../domain/entities/prestador/prestador.entity";

export type PrestadorAtualizadoRespostaDTO = Partial<Pick<Prestador, 'descricao' | 'telefone'>>
