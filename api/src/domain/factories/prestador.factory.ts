import { Prestador } from "../entities/prestador/prestador.entity";
import { IdClienteValueObject } from "../value-objects/prestador/idCliente/id-cliente.vo";

export class PrestadorFactory {
    public static criar(dados: {
        id ?: string
        idCliente : string
    }) : Prestador {
        return Prestador.criarPrestador({
            id : dados.id,
            idCliente : new IdClienteValueObject(dados.idCliente)
        })
    }
}