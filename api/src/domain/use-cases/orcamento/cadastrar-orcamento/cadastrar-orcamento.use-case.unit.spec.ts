import { Types } from "mongoose";
import { CadastrarOrcamentoUseCase } from "./cadastrar-orcamento.use-case";
import { OrcamentoMother } from "../../../../test-helpers/orcamento.mother";
import { SolicitacaoMother } from "../../../../test-helpers/solicitacao.mother";
import { ServicoMother } from "../../../../test-helpers/servico.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { CampoObrigatorioVazioError } from "../../../errors/campo-obrigatorio-vazio.error";
import { StatusSolicitacao } from "../../../value-objects/solicitacao/status/status.vo";

describe('CadastrarOrcamentoUseCase', () => {
    let useCase: CadastrarOrcamentoUseCase
    let orcamentoRepoMock: ReturnType<typeof OrcamentoMother.criarRepositoryMock>
    let solicitacaoRepoMock: ReturnType<typeof SolicitacaoMother.criarRepositoryMock>
    let servicoRepoMock: ReturnType<typeof ServicoMother.criarRepositoryMock>

    beforeEach(() => {
        orcamentoRepoMock = OrcamentoMother.criarRepositoryMock()
        solicitacaoRepoMock = SolicitacaoMother.criarRepositoryMock()
        servicoRepoMock = ServicoMother.criarRepositoryMock()
        useCase = new CadastrarOrcamentoUseCase(orcamentoRepoMock, solicitacaoRepoMock, servicoRepoMock)
    })

    it('deve cadastrar um orçamento com sucesso para solicitação geral com categoria válida', async () => {
        // Arrange
        const idCategoria = new Types.ObjectId().toString()
        const idPrestador = new Types.ObjectId().toString()
        const solicitacao = SolicitacaoMother.criarValido({ idCategoria })
        const servico = ServicoMother.criarValido({ idPrestador, idCategoria })
        const orcamentoSalvo = OrcamentoMother.criarValido({ idPrestador })

        solicitacaoRepoMock.buscarPorId.mockResolvedValue(solicitacao)
        servicoRepoMock.buscarPorIdPrestador.mockResolvedValue([servico])
        orcamentoRepoMock.inserir.mockResolvedValue(orcamentoSalvo)

        const dto = OrcamentoMother.criarDTO({ idPrestador, idSolicitacao: new Types.ObjectId().toString(), idCategoria: undefined })
        // Act
        const resultado = await useCase.execute({ ...dto, idPrestador })
        // Assert
        expect(resultado).toBe(orcamentoSalvo)
        expect(orcamentoRepoMock.inserir).toHaveBeenCalledTimes(1)
    })

    it('deve cadastrar com sucesso para solicitação direta ao prestador', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        const solicitacao = SolicitacaoMother.criarValido({ idPrestadorDireto: idPrestador })
        const orcamentoSalvo = OrcamentoMother.criarValido({ idPrestador })

        solicitacaoRepoMock.buscarPorId.mockResolvedValue(solicitacao)
        orcamentoRepoMock.inserir.mockResolvedValue(orcamentoSalvo)

        const dto = OrcamentoMother.criarDTO({ idPrestador })
        // Act
        const resultado = await useCase.execute(dto)
        // Assert
        expect(resultado).toBe(orcamentoSalvo)
        expect(servicoRepoMock.buscarPorIdPrestador).not.toHaveBeenCalled()
    })

    it('deve lançar CampoObrigatorioVazioError se idSolicitacao não for informado', async () => {
        // Arrange — spread após criarDTO para sobrescrever o idSolicitacao já gerado pelo ??
        const dto = { ...OrcamentoMother.criarDTO(), idSolicitacao: undefined as any }
        // Act & Assert
        await expect(useCase.execute(dto)).rejects.toThrow(CampoObrigatorioVazioError)
        expect(solicitacaoRepoMock.buscarPorId).not.toHaveBeenCalled()
    })

    it('deve lançar RecursoNaoEncontradoError se solicitação não existir', async () => {
        // Arrange
        solicitacaoRepoMock.buscarPorId.mockResolvedValue(null)
        const dto = OrcamentoMother.criarDTO()
        // Act & Assert
        await expect(useCase.execute(dto)).rejects.toThrow(RecursoNaoEncontradoError)
    })

    it('deve lançar OperacaoNaoPermitidaError se prestador tentar orçar solicitação própria', async () => {
        // Arrange
        const idClienteDoPrestador = new Types.ObjectId().toString()
        const solicitacao = SolicitacaoMother.criarValido({ idCliente: idClienteDoPrestador })
        solicitacaoRepoMock.buscarPorId.mockResolvedValue(solicitacao)
        const dto = OrcamentoMother.criarDTO({ idClienteDoPrestador })
        // Act & Assert
        await expect(useCase.execute(dto)).rejects.toThrow(OperacaoNaoPermitidaError)
        expect(orcamentoRepoMock.inserir).not.toHaveBeenCalled()
    })

    it('deve lançar OperacaoNaoPermitidaError se solicitação não estiver aberta', async () => {
        // Arrange
        const solicitacao = SolicitacaoMother.criarValido({ status: StatusSolicitacao.ENCERRADA })
        solicitacaoRepoMock.buscarPorId.mockResolvedValue(solicitacao)
        const dto = OrcamentoMother.criarDTO()
        // Act & Assert
        await expect(useCase.execute(dto)).rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar AcessoProibidoError se solicitação direta for endereçada a outro prestador', async () => {
        // Arrange
        const outroPrestador = new Types.ObjectId().toString()
        const idPrestador = new Types.ObjectId().toString()
        const solicitacao = SolicitacaoMother.criarValido({ idPrestadorDireto: outroPrestador })
        solicitacaoRepoMock.buscarPorId.mockResolvedValue(solicitacao)
        const dto = OrcamentoMother.criarDTO({ idPrestador })
        // Act & Assert
        await expect(useCase.execute(dto)).rejects.toThrow(AcessoProibidoError)
    })

    it('deve lançar AcessoProibidoError se categoria do prestador não coincidir com a da solicitação', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        const solicitacao = SolicitacaoMother.criarValido({ idCategoria: new Types.ObjectId().toString() })
        const servico = ServicoMother.criarValido({ idPrestador, idCategoria: new Types.ObjectId().toString() })
        solicitacaoRepoMock.buscarPorId.mockResolvedValue(solicitacao)
        servicoRepoMock.buscarPorIdPrestador.mockResolvedValue([servico])
        const dto = OrcamentoMother.criarDTO({ idPrestador })
        // Act & Assert
        await expect(useCase.execute(dto)).rejects.toThrow(AcessoProibidoError)
    })
})
