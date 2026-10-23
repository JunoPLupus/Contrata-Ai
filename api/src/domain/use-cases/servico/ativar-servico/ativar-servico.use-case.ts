import { IServicoRepository } from "../../../repositories/servico.repository";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

export class AtivarServicoUseCase {
    constructor(private readonly servicoRepository: IServicoRepository) {}

    /**
     * Reativa um servico pausado, verificando a propriedade do prestador logado.
     * Idempotente: ativar um servico ja ativo nao gera erro.
     * @param id - ID do servico a ser ativado.
     * @param idPrestador - ID do prestador autenticado extraido do token JWT.
     * @throws {RecursoNaoEncontradoError} Se nenhum servico for encontrado com esse ID.
     * @throws {AcessoProibidoError} Se o servico pertencer a outro prestador.
     */
    async execute(id: string, idPrestador: string): Promise<void> {
        const servico = await this.servicoRepository.buscarPorId(id)
        if (!servico) throw new RecursoNaoEncontradoError('Serviço')
        if (servico.idPrestador !== idPrestador) throw new AcessoProibidoError()

        servico.ativar()
        await this.servicoRepository.atualizar(servico)
    }
}
