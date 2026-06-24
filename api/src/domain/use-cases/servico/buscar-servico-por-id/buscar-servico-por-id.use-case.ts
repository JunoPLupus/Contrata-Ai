import { Servico } from "../../../entities/servico/servico.entity";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

export class BuscarServicoPorIdUseCase {
    constructor(private readonly servicoRepository: IServicoRepository) {}

    /**
     * Busca um servico pelo ID, verificando se pertence ao prestador logado.
     * @param id - ID do servico a ser buscado.
     * @param idPrestador - ID do prestador autenticado extraido do token JWT.
     * @returns O servico encontrado.
     * @throws {RecursoNaoEncontradoError} Se nenhum servico for encontrado com esse ID.
     * @throws {AcessoProibidoError} Se o servico pertencer a outro prestador.
     */
    async execute(id: string, idPrestador: string): Promise<Servico> {
        const servico = await this.servicoRepository.buscarPorId(id)
        if (!servico) throw new RecursoNaoEncontradoError('Serviço')
        if (servico.idPrestador !== idPrestador) throw new AcessoProibidoError()

        return servico
    }
}
