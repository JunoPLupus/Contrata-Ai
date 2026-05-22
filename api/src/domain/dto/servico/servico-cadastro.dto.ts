import { Servico } from "../../entities/servico/servico.entity";

export type ServicoCadastroDTO = Pick< Servico, 'idPrestador' | 'idCategoria' | 'descricao' | 'precoMin' | 'precoMax' | 'prazoMedioDias' >