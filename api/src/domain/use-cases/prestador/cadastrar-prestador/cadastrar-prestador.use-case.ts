import { Prestador } from "../../../entities/prestador/prestador.entity";
import { IPrestadorRepository } from "../../../repositories/prestador.repository";
import { CampoObrigatorioVazioError } from "../../../errors/campo-obrigatorio-vazio.error";
import { PrestadorFactory } from "../../../factories/prestador.factory";
import { PrestadorCadastroDTO } from "../../../dto/prestador/prestador-cadastro.dto";

export class CadastrarPrestadorUseCase {
    constructor(private readonly prestadorRepository: IPrestadorRepository) {}

    async execute(prestadorDTO : PrestadorCadastroDTO): Promise<Prestador> {
        if(this.isVazio(prestadorDTO.idCliente)) throw new CampoObrigatorioVazioError('idCliente')

        const prestador : Prestador = PrestadorFactory.criar({
            idCliente: prestadorDTO.idCliente
        })
        return this.prestadorRepository.inserir(prestador)
    }

    private isVazio(idCliente : string) : boolean {
        return idCliente.trim().length == 0
    }
}