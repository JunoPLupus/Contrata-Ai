import { Prestador } from "../../../../domain/entities/prestador/prestador.entity";

export type PrestadorPerfilCompletoRespostaDTO = Pick<Prestador, 'id' | 'idCliente' | 'telefone' | 'descricao'>
