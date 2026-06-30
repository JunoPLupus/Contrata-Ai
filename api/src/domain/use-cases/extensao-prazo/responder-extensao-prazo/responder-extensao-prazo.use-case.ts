import { ExtensaoPrazo } from "../../../entities/extensao-prazo/extensao-prazo.entity";
import { IContratoRepository } from "../../../repositories/contrato.repository";
import { IExtensaoPrazoRepository } from "../../../repositories/extensao-prazo.repository";
import { ExtensaoPrazoDecisaoDTO } from "../../../dto/extensao-prazo/extensao-prazo-decisao.dto";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { StatusExtensaoPrazo } from "../../../value-objects/extensao-prazo/status/status.vo";

export class ResponderExtensaoPrazoUseCase {
    constructor(
        private readonly contratoRepository: IContratoRepository,
        private readonly extensaoPrazoRepository: IExtensaoPrazoRepository
    ) {}

    /**
     * Responde a uma solicitação de extensão de prazo (UC20).
     * - Se **aprovada**: atualiza o `prazoEstimado` do contrato para `novoPrazo`.
     * - Se **recusada**: mantém o prazo do contrato inalterado.
     *
     * @param idContrato - ID do contrato ao qual a extensão pertence.
     * @param idExtensao - ID da extensão de prazo a ser respondida.
     * @param idCliente - ID do cliente autenticado extraído do token JWT.
     * @param dados - DTO com a decisão (`'aprovada'` ou `'recusada'`).
     * @returns A extensão de prazo com o status atualizado.
     * @throws {RecursoNaoEncontradoError} Se o contrato ou a extensão não existirem, ou a extensão não pertencer ao contrato.
     * @throws {AcessoProibidoError} Se o usuário não for o cliente do contrato.
     * @throws {OperacaoNaoPermitidaError} Se a extensão não estiver com status `'pendente'`.
     */
    async execute(idContrato: string, idExtensao: string, idCliente: string, dados: ExtensaoPrazoDecisaoDTO): Promise<ExtensaoPrazo> {
        const contrato = await this.contratoRepository.buscarPorId(idContrato)
        if (!contrato) throw new RecursoNaoEncontradoError('Contrato')
        if (contrato.idCliente !== idCliente) throw new AcessoProibidoError()

        const extensao = await this.extensaoPrazoRepository.buscarPorId(idExtensao)
        if (!extensao || extensao.idContrato !== idContrato) {
            throw new RecursoNaoEncontradoError('Extensão de prazo')
        }

        if (extensao.status !== StatusExtensaoPrazo.PENDENTE) {
            throw new OperacaoNaoPermitidaError(
                'Só é possível responder a uma extensão de prazo com status pendente.'
            )
        }

        extensao.status = dados.decisao
        extensao.dataResposta = new Date()
        await this.extensaoPrazoRepository.atualizar(extensao)

        if (dados.decisao === StatusExtensaoPrazo.APROVADA) {
            contrato.prazoEstimado = extensao.novoPrazo
            await this.contratoRepository.atualizar(contrato)
        }

        return extensao
    }
}
