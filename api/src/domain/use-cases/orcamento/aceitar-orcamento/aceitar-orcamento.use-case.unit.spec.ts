import { Types } from "mongoose";
import { AceitarOrcamentoUseCase } from "./aceitar-orcamento.use-case";
import { OrcamentoMother } from "../../../../test-helpers/orcamento.mother";
import { SolicitacaoMother } from "../../../../test-helpers/solicitacao.mother";
import { ContratоMother } from "../../../../test-helpers/contrato.mother";
import { AtualizarSolicitacaoUseCase } from "../../solicitacao/atualizar-solicitacao/atualizar-solicitacao.use-case";
import { CriarContratoUseCase } from "../../contrato/criar-contrato/criar-contrato.use-case";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { StatusOrcamento } from "../../../value-objects/orcamento/status/status.vo";
import { StatusSolicitacao } from "../../../value-objects/solicitacao/status/status.vo";
import { StatusContrato } from "../../../value-objects/contrato/status/status.vo";

describe('AceitarOrcamentoUseCase', () => {
    let useCase: AceitarOrcamentoUseCase
    let orcamentoRepoMock: ReturnType<typeof OrcamentoMother.criarRepositoryMock>
    let solicitacaoRepoMock: ReturnType<typeof SolicitacaoMother.criarRepositoryMock>
    let atualizarSolicitacaoUseCaseMock: jest.Mocked<AtualizarSolicitacaoUseCase>
    let criarContratoUseCaseMock: jest.Mocked<CriarContratoUseCase>

    beforeEach(() => {
        orcamentoRepoMock = OrcamentoMother.criarRepositoryMock()
        solicitacaoRepoMock = SolicitacaoMother.criarRepositoryMock()
        atualizarSolicitacaoUseCaseMock = {
            execute: jest.fn()
        } as unknown as jest.Mocked<AtualizarSolicitacaoUseCase>
        criarContratoUseCaseMock = {
            execute: jest.fn()
        } as unknown as jest.Mocked<CriarContratoUseCase>

        useCase = new AceitarOrcamentoUseCase(orcamentoRepoMock, solicitacaoRepoMock, atualizarSolicitacaoUseCaseMock, criarContratoUseCaseMock)
    })

    it('deve aceitar o orçamento e preencher dataAceite', async () => {
        // Arrange
        const idCliente = new Types.ObjectId().toString()
        const idSolicitacao = new Types.ObjectId().toString()
        const orcamento = OrcamentoMother.criarValido({ idSolicitacao })
        const solicitacao = SolicitacaoMother.criarValido({ idCliente })
        const orcamentoAceito = OrcamentoMother.criarValido({ idSolicitacao, status: StatusOrcamento.ACEITO })

        orcamentoRepoMock.buscarPorId.mockResolvedValue(orcamento)
        solicitacaoRepoMock.buscarPorId.mockResolvedValue(solicitacao)
        orcamentoRepoMock.buscarPorIdSolicitacao.mockResolvedValue([orcamento])
        orcamentoRepoMock.atualizar.mockResolvedValue(orcamentoAceito)
        atualizarSolicitacaoUseCaseMock.execute.mockResolvedValue(solicitacao as any)
        criarContratoUseCaseMock.execute.mockResolvedValue(ContratоMother.criarValido())

        // Act
        const resultado = await useCase.execute('algum-id', idCliente)

        // Assert
        expect(resultado.status).toBe(StatusOrcamento.ACEITO)
        expect(orcamento.dataAceite).toBeInstanceOf(Date)
    })

    it('deve encerrar outros orçamentos pendentes da solicitação', async () => {
        // Arrange
        const idCliente = new Types.ObjectId().toString()
        const idSolicitacao = new Types.ObjectId().toString()
        const orcamentoAlvo = OrcamentoMother.criarValido({ idSolicitacao })
        const outroOrcamento = OrcamentoMother.criarValido({ idSolicitacao })
        const solicitacao = SolicitacaoMother.criarValido({ idCliente })
        const orcamentoAceito = OrcamentoMother.criarValido({ idSolicitacao, status: StatusOrcamento.ACEITO })

        orcamentoRepoMock.buscarPorId.mockResolvedValue(orcamentoAlvo)
        solicitacaoRepoMock.buscarPorId.mockResolvedValue(solicitacao)
        orcamentoRepoMock.buscarPorIdSolicitacao.mockResolvedValue([orcamentoAlvo, outroOrcamento])
        orcamentoRepoMock.atualizar.mockResolvedValue(orcamentoAceito)
        atualizarSolicitacaoUseCaseMock.execute.mockResolvedValue(solicitacao as any)
        criarContratoUseCaseMock.execute.mockResolvedValue(ContratоMother.criarValido())

        // Act
        await useCase.execute('algum-id', idCliente)

        // Assert — atualizar chamado 2x: aceito + encerrar o outro
        expect(orcamentoRepoMock.atualizar).toHaveBeenCalledTimes(2)
        expect(outroOrcamento.status).toBe(StatusOrcamento.ENCERRADO)
    })

    it('deve encerrar a solicitação via AtualizarSolicitacaoUseCase', async () => {
        // Arrange
        const idCliente = new Types.ObjectId().toString()
        const idSolicitacao = new Types.ObjectId().toString()
        const orcamento = OrcamentoMother.criarValido({ idSolicitacao })
        const solicitacao = SolicitacaoMother.criarValido({ idCliente })

        orcamentoRepoMock.buscarPorId.mockResolvedValue(orcamento)
        solicitacaoRepoMock.buscarPorId.mockResolvedValue(solicitacao)
        orcamentoRepoMock.buscarPorIdSolicitacao.mockResolvedValue([orcamento])
        orcamentoRepoMock.atualizar.mockResolvedValue(orcamento)
        atualizarSolicitacaoUseCaseMock.execute.mockResolvedValue(solicitacao as any)
        criarContratoUseCaseMock.execute.mockResolvedValue(ContratоMother.criarValido())

        // Act
        await useCase.execute('algum-id', idCliente)

        // Assert
        expect(atualizarSolicitacaoUseCaseMock.execute).toHaveBeenCalledWith(
            idSolicitacao,
            idCliente,
            { status: StatusSolicitacao.ENCERRADA }
        )
    })

    it('deve criar o contrato ao aceitar o orçamento com cienciaPagamento e whatsappLiberado true', async () => {
        // Arrange
        const idCliente = new Types.ObjectId().toString()
        const idSolicitacao = new Types.ObjectId().toString()
        const orcamento = OrcamentoMother.criarValido({ idSolicitacao })
        const solicitacao = SolicitacaoMother.criarValido({ idCliente })
        const orcamentoAceito = OrcamentoMother.criarValido({ idSolicitacao, status: StatusOrcamento.ACEITO, dataAceite: new Date() })

        orcamentoRepoMock.buscarPorId.mockResolvedValue(orcamento)
        solicitacaoRepoMock.buscarPorId.mockResolvedValue(solicitacao)
        orcamentoRepoMock.buscarPorIdSolicitacao.mockResolvedValue([orcamento])
        orcamentoRepoMock.atualizar.mockResolvedValue(orcamentoAceito)
        atualizarSolicitacaoUseCaseMock.execute.mockResolvedValue(solicitacao as any)
        criarContratoUseCaseMock.execute.mockResolvedValue(
            ContratоMother.criarValido({ status: StatusContrato.AGUARDANDO_INICIO, cienciaPagamento: true, whatsappLiberado: true })
        )

        // Act
        await useCase.execute('algum-id', idCliente)

        // Assert
        expect(criarContratoUseCaseMock.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                idSolicitacao,
                idCliente,
                idPrestador: orcamentoAceito.idPrestador,
            })
        )
    })

    it('deve lançar RecursoNaoEncontradoError se orçamento não existir', async () => {
        // Arrange
        orcamentoRepoMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(useCase.execute('id-inexistente', new Types.ObjectId().toString()))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })

    it('deve lançar RecursoNaoEncontradoError se solicitação não existir', async () => {
        // Arrange
        const orcamento = OrcamentoMother.criarValido()
        orcamentoRepoMock.buscarPorId.mockResolvedValue(orcamento)
        solicitacaoRepoMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(useCase.execute('algum-id', new Types.ObjectId().toString()))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })

    it('deve lançar AcessoProibidoError se cliente não for dono da solicitação', async () => {
        // Arrange
        const orcamento = OrcamentoMother.criarValido()
        const solicitacao = SolicitacaoMother.criarValido({ idCliente: new Types.ObjectId().toString() })
        orcamentoRepoMock.buscarPorId.mockResolvedValue(orcamento)
        solicitacaoRepoMock.buscarPorId.mockResolvedValue(solicitacao)
        // Act & Assert
        await expect(useCase.execute('algum-id', new Types.ObjectId().toString()))
            .rejects.toThrow(AcessoProibidoError)
    })

    it('deve lançar OperacaoNaoPermitidaError se orçamento não estiver pendente', async () => {
        // Arrange
        const idCliente = new Types.ObjectId().toString()
        const orcamento = OrcamentoMother.criarValido({ status: StatusOrcamento.ENCERRADO })
        const solicitacao = SolicitacaoMother.criarValido({ idCliente })
        orcamentoRepoMock.buscarPorId.mockResolvedValue(orcamento)
        solicitacaoRepoMock.buscarPorId.mockResolvedValue(solicitacao)
        // Act & Assert
        await expect(useCase.execute('algum-id', idCliente))
            .rejects.toThrow(OperacaoNaoPermitidaError)
    })
})
