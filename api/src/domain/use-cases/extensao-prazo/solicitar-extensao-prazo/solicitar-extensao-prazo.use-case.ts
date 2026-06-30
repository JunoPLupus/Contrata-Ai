import { ExtensaoPrazo } from "../../../entities/extensao-prazo/extensao-prazo.entity";
import { IContratoRepository } from "../../../repositories/contrato.repository";
import { IExtensaoPrazoRepository } from "../../../repositories/extensao-prazo.repository";
import { ExtensaoPrazoCadastroDTO } from "../../../dto/extensao-prazo/extensao-prazo-cadastro.dto";
import { ExtensaoPrazoFactory } from "../../../factories/extensao-prazo.factory";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { StatusContrato } from "../../../value-objects/contrato/status/status.vo";

const statusTerminais = [StatusContrato.CONCLUIDO, StatusContrato.CANCELADO]

export class SolicitarExtensaoPrazoUseCase {
    constructor(
        private readonly contratoRepository: IContratoRepository,
        private readonly extensaoPrazoRepository: IExtensaoPrazoRepository
    ) {}

    /**
     * Cria uma solicitação de extensão de prazo para um contrato ativo (UC20/RF21).
     * O `novoPrazo` deve ser posterior ao `prazoEstimado` atual do contrato (UC20-E01).
     *
     * @param idContrato - ID do contrato ao qual a extensão pertence.
     * @param idPrestador - ID do prestador autenticado extraído do token JWT.
     * @param dados - DTO com `novoPrazo` e `justificativa`.
     * @returns A extensão de prazo criada com status `'pendente'`.
     * @throws {RecursoNaoEncontradoError} Se o contrato não existir.
     * @throws {AcessoProibidoError} Se o prestador logado não for o do contrato.
     * @throws {OperacaoNaoPermitidaError} Se o contrato estiver em estado terminal.
     * @throws {OperacaoNaoPermitidaError} Se `novoPrazo` não for posterior ao `prazoEstimado` atual.
     */
    async execute(idContrato: string, idPrestador: string, dados: ExtensaoPrazoCadastroDTO): Promise<ExtensaoPrazo> {
        const contrato = await this.contratoRepository.buscarPorId(idContrato)
        if (!contrato) throw new RecursoNaoEncontradoError('Contrato')
        if (contrato.idPrestador !== idPrestador) throw new AcessoProibidoError()

        if (statusTerminais.includes(contrato.status as any)) {
            throw new OperacaoNaoPermitidaError(
                'Não é possível solicitar extensão de prazo para um contrato concluído ou cancelado.'
            )
        }

        const prazoAtual = contrato.prazoEstimado
        if (prazoAtual && dados.novoPrazo <= prazoAtual) {
            throw new OperacaoNaoPermitidaError(
                'O novo prazo deve ser posterior ao prazo estimado atual do contrato.'
            )
        }

        const extensao = ExtensaoPrazoFactory.criar({
            idContrato,
            novoPrazo: dados.novoPrazo,
            justificativa: dados.justificativa,
        })

        return this.extensaoPrazoRepository.inserir(extensao)
    }
}
