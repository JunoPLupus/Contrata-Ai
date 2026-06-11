import { Prestador } from "../entities/prestador/prestador.entity";
import { StringValueObject } from "../value-objects/shared/string/string.vo";

export class PrestadorFactory {
    public static criar(dados: {
        id ?: string
        idCliente : string
    }) : Prestador {
        return Prestador.criarPrestador({
            id : dados.id,
            idCliente : new StringValueObject('idCliente', dados.idCliente)
        })
    }
}
