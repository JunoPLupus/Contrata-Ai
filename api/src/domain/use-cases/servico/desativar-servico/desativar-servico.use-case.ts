import { IServicoRepository } from "../../../repositories/servico.repository";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

export class DesativarServicoUseCase {
    constructor(private readonly servicoRepository: IServicoRepository) {}

    /**
     * Pausa um servico sem apaga-lo, verificando a propriedade do prestador logado.
     * Bloqueia apenas pedidos novos: orcamentos pendentes e contratos ja existentes seguem normalmente.
     * Idempotente: desativar um servico ja inativo nao gera erro.
     * @param id - ID do servico a ser desativado.
     * @param idPrestador - ID do prestador autenticado extraido do token JWT.
     * @throws {RecursoNaoEncontradoError} Se nenhum servico for encontrado com esse ID.
     * @throws {AcessoProibidoError} Se o servico pertencer a outro prestador.
     */
    async execute(id: string, idPrestador: string): Promise<void> {
        const servico = await this.servicoRepository.buscarPorId(id)
        if (!servico) throw new RecursoNaoEncontradoError('Serviço')
        if (servico.idPrestador !== idPrestador) throw new AcessoProibidoError()

        servico.desativar()
        await this.servicoRepository.atualizar(servico)
    }
}
