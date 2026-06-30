import { Prestador } from "../../../../domain/entities/prestador/prestador.entity";

export type PrestadorRespostaCadastroDTO = Pick< Prestador, 'id' | 'idCliente' >