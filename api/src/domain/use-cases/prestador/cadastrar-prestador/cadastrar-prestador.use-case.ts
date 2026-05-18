import { Prestador } from "../../../entities/prestador/prestador.entity";
import { IPrestadorRepository } from "../../../repositories/prestador.repository";
import { PrestadorFactory } from "../../../factories/prestador.factory";
import { PrestadorCadastroDTO } from "../../../dto/prestador/prestador-cadastro.dto";

export class CadastrarPrestadorUseCase {
    constructor(private readonly prestadorRepository: IPrestadorRepository) {}

    async execute(prestadorDTO : PrestadorCadastroDTO): Promise<Prestador> {
        const prestador : Prestador = PrestadorFactory.criar({
            idCliente: prestadorDTO.idCliente
        })
        return this.prestadorRepository.inserir(prestador)
    }
}