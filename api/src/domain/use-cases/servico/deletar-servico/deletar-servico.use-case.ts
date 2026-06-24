import { IServicoRepository } from "../../../repositories/servico.repository";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

export class DeletarServicoUseCase {
    constructor(private readonly servicoRepository: IServicoRepository) {}

    /**
     * Deleta um servico existente, verificando a propriedade do prestador logado.
     * @param id - ID do servico a ser deletado.
     * @param idPrestador - ID do prestador autenticado extraido do token JWT.
     * @throws {RecursoNaoEncontradoError} Se nenhum servico for encontrado com esse ID.
     * @throws {AcessoProibidoError} Se o servico pertencer a outro prestador.
     */
    async execute(id: string, idPrestador: string): Promise<void> {
        const servico = await this.servicoRepository.buscarPorId(id)
        if (!servico) throw new RecursoNaoEncontradoError('Serviço')
        if (servico.idPrestador !== idPrestador) throw new AcessoProibidoError()

        await this.servicoRepository.deletar(id)
    }
}
