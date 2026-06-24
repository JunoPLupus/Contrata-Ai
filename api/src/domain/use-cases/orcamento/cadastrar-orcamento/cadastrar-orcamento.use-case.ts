import { Orcamento } from "../../../entities/orcamento/orcamento.entity";
import { IOrcamentoRepository } from "../../../repositories/orcamento.repository";
import { ISolicitacaoRepository } from "../../../repositories/solicitacao.repository";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { OrcamentoFactory } from "../../../factories/orcamento.factory";
import { OrcamentoCadastroDTO } from "../../../dto/orcamento/orcamento-cadastro.dto";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { StatusSolicitacao } from "../../../value-objects/solicitacao/status/status.vo";

export class CadastrarOrcamentoUseCase {
    constructor(
        private readonly orcamentoRepository: IOrcamentoRepository,
        private readonly solicitacaoRepository: ISolicitacaoRepository,
        private readonly servicoRepository: IServicoRepository
    ) {}

    /**
     * Cadastra um novo orçamento para uma solicitação existente e aberta.
     * O status é sempre `'pendente'` e dataCriacao é gerada automaticamente.
     * @param dto - Dados do orçamento a ser criado (`idSolicitacao`, `idPrestador`, `valor`, `prazoDias?`).
     * @returns O orçamento persistido com o `id` preenchido pelo banco.
     * @throws {RecursoNaoEncontradoError} Se a solicitação não existir.
     * @throws {OperacaoNaoPermitidaError} Se a solicitação não estiver com status `'aberta'`.
     * @throws {AcessoProibidoError} Se o prestador não tiver visibilidade sobre a solicitação.
     */
    async execute(dto: OrcamentoCadastroDTO): Promise<Orcamento> {
        const orcamento = OrcamentoFactory.criar({
            idSolicitacao: dto.idSolicitacao,
            idPrestador: dto.idPrestador,
            valor: dto.valor,
            prazoDias: dto.prazoDias
        })

        const solicitacao = await this.solicitacaoRepository.buscarPorId(dto.idSolicitacao)
        if (!solicitacao) throw new RecursoNaoEncontradoError('Solicitação')

        if (dto.idClienteDoPrestador && solicitacao.idCliente === dto.idClienteDoPrestador) {
            throw new OperacaoNaoPermitidaError('Não é permitido enviar orçamento para a própria solicitação.')
        }

        if (solicitacao.status !== StatusSolicitacao.ABERTA) {
            throw new OperacaoNaoPermitidaError(
                "Só é possível enviar orçamento para solicitações com status 'aberta'."
            )
        }

        if (solicitacao.idPrestadorDireto !== undefined) {
            if (solicitacao.idPrestadorDireto !== dto.idPrestador) {
                throw new AcessoProibidoError()
            }
        } else {
            const servicos = await this.servicoRepository.buscarPorIdPrestador(dto.idPrestador)
            const categoriasDoPrestador = servicos.map(s => s.idCategoria)
            if (!categoriasDoPrestador.includes(solicitacao.idCategoria)) {
                throw new AcessoProibidoError()
            }
        }

        return this.orcamentoRepository.inserir(orcamento)
    }
}
