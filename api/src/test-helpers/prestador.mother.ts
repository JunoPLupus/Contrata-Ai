import { Types } from "mongoose";

import { Prestador } from "../domain/entities/prestador/prestador.entity";
import { PrestadorFactory } from "../domain/factories/prestador.factory";
import { PrestadorCadastroDTO } from "../domain/dto/prestador/prestador-cadastro.dto";

export class PrestadorMother {
    public static criarValido(dto ?: PrestadorCadastroDTO) : Prestador {
        return PrestadorFactory.criar({
            idCliente : dto?.idCliente ?? (new Types.ObjectId).toString()
        })
    }
    public static criarDTO(dto ?: PrestadorCadastroDTO) : PrestadorCadastroDTO {
        return {
            idCliente : dto?.idCliente ?? (new Types.ObjectId).toString()
        }
    }
}