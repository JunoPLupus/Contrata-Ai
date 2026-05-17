import { Prestador } from "../../../entities/prestador/prestador.entity";
import { IPrestadorRepository } from "../../../repositories/prestador.repository";
import { CampoObrigatorioVazioError } from "../../../errors/campo-obrigatorio-vazio.error";

export class CadastrarPrestadorUseCase {
    constructor(private readonly prestadorRepository: IPrestadorRepository) {}

    async execute(idCliente: string): Promise<Prestador> {
        if(this.isVazio(idCliente)) throw new CampoObrigatorioVazioError('idCliente')

        const propsPrestador = {
            idCliente: idCliente,
        }
        const prestador : Prestador = Prestador.criarPrestador(propsPrestador)
        return this.prestadorRepository.inserir(prestador)
    }

    private isVazio(idCliente : string) : boolean {
        return idCliente.trim().length == 0
    }
}