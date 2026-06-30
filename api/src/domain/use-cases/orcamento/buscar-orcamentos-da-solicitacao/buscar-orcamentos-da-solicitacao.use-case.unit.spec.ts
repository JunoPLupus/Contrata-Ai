import { Types } from "mongoose";
import { BuscarOrcamentosDaSolicitacaoUseCase } from "./buscar-orcamentos-da-solicitacao.use-case";
import { OrcamentoMother } from "../../../../test-helpers/orcamento.mother";
import { SolicitacaoMother } from "../../../../test-helpers/solicitacao.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { StatusOrcamento } from "../../../value-objects/orcamento/status/status.vo";

describe('BuscarOrcamentosDaSolicitacaoUseCase', () => {
    let useCase: BuscarOrcamentosDaSolicitacaoUseCase
    let orcamentoRepoMock: ReturnType<typeof OrcamentoMother.criarRepositoryMock>
    let solicitacaoRepoMock: ReturnType<typeof SolicitacaoMother.criarRepositoryMock>

    beforeEach(() => {
        orcamentoRepoMock = OrcamentoMother.criarRepositoryMock()
        solicitacaoRepoMock = SolicitacaoMother.criarRepositoryMock()
        useCase = new BuscarOrcamentosDaSolicitacaoUseCase(orcamentoRepoMock, solicitacaoRepoMock)
    })

    it('deve retornar orçamentos pendentes e aceitos da solicitação', async () => {
        // Arrange
        const idCliente = new Types.ObjectId().toString()
        const idSolicitacao = new Types.ObjectId().toString()
        const solicitacao = SolicitacaoMother.criarValido({ idCliente })
        const pendente = OrcamentoMother.criarValido({ idSolicitacao, status: StatusOrcamento.PENDENTE })
        const aceito = OrcamentoMother.criarValido({ idSolicitacao, status: StatusOrcamento.ACEITO })
        const encerrado = OrcamentoMother.criarValido({ idSolicitacao, status: StatusOrcamento.ENCERRADO })
        const cancelado = OrcamentoMother.criarValido({ idSolicitacao, status: StatusOrcamento.CANCELADO })

        solicitacaoRepoMock.buscarPorId.mockResolvedValue(solicitacao)
        orcamentoRepoMock.buscarPorIdSolicitacao.mockResolvedValue([pendente, aceito, encerrado, cancelado])
        // Act
        const resultado = await useCase.execute(idSolicitacao, idCliente)
        // Assert
        expect(resultado).toHaveLength(2)
        expect(resultado.map(o => o.status)).toEqual(
            expect.arrayContaining([StatusOrcamento.PENDENTE, StatusOrcamento.ACEITO])
        )
        expect(orcamentoRepoMock.buscarPorIdSolicitacao).toHaveBeenCalledWith(idSolicitacao)
    })

    it('deve retornar array vazio se não houver orçamentos pendentes nem aceitos', async () => {
        // Arrange
        const idCliente = new Types.ObjectId().toString()
        const idSolicitacao = new Types.ObjectId().toString()
        const solicitacao = SolicitacaoMother.criarValido({ idCliente })
        const encerrado = OrcamentoMother.criarValido({ idSolicitacao, status: StatusOrcamento.ENCERRADO })
        const cancelado = OrcamentoMother.criarValido({ idSolicitacao, status: StatusOrcamento.CANCELADO })

        solicitacaoRepoMock.buscarPorId.mockResolvedValue(solicitacao)
        orcamentoRepoMock.buscarPorIdSolicitacao.mockResolvedValue([encerrado, cancelado])
        // Act
        const resultado = await useCase.execute(idSolicitacao, idCliente)
        // Assert
        expect(resultado).toHaveLength(0)
    })

    it('deve lançar RecursoNaoEncontradoError se a solicitação não existir', async () => {
        // Arrange
        solicitacaoRepoMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(useCase.execute(new Types.ObjectId().toString(), new Types.ObjectId().toString()))
            .rejects.toThrow(RecursoNaoEncontradoError)
        expect(orcamentoRepoMock.buscarPorIdSolicitacao).not.toHaveBeenCalled()
    })

    it('deve lançar AcessoProibidoError se o cliente não for o dono da solicitação', async () => {
        // Arrange
        const solicitacao = SolicitacaoMother.criarValido({ idCliente: new Types.ObjectId().toString() })
        const outroCliente = new Types.ObjectId().toString()
        solicitacaoRepoMock.buscarPorId.mockResolvedValue(solicitacao)
        // Act & Assert
        await expect(useCase.execute(new Types.ObjectId().toString(), outroCliente))
            .rejects.toThrow(AcessoProibidoError)
        expect(orcamentoRepoMock.buscarPorIdSolicitacao).not.toHaveBeenCalled()
    })
})
