import { Prestador } from "../entities/prestador/prestador.entity";

export class PrestadorFactory {
    public static criar(dados: {
        id ?: string
        idCliente : string
    }) : Prestador {
        return Prestador.criarPrestador({
            id : dados.id,
            idCliente : dados.idCliente
        })
    }
}