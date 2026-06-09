import { Prestador } from "../../../entities/prestador/prestador.entity";
import { IPrestadorRepository } from "../../../repositories/prestador.repository";
import { IUsuarioRepository } from "../../../repositories/usuario.repository";
import { PrestadorFactory } from "../../../factories/prestador.factory";
import { PrestadorCadastroDTO } from "../../../dto/prestador/prestador-cadastro.dto";

export class CadastrarPrestadorUseCase {
    constructor(
        private readonly prestadorRepository: IPrestadorRepository,
        private readonly usuarioRepository: IUsuarioRepository
    ) {}

    /**
     * Cadastra um novo prestador e vincula o seu `id` ao usuário correspondente.
     * @param prestadorDTO - Dados necessários para o cadastro do prestador.
     * @returns O prestador persistido com o `id` preenchido pelo banco.
     */
    async execute(prestadorDTO : PrestadorCadastroDTO): Promise<Prestador> {
        const prestador : Prestador = PrestadorFactory.criar({
            idCliente: prestadorDTO.idCliente
        })
        const prestadorInserido = await this.prestadorRepository.inserir(prestador)
        await this.usuarioRepository.vincularPrestador(prestadorDTO.idCliente, prestadorInserido.id!)
        return prestadorInserido
    }
}