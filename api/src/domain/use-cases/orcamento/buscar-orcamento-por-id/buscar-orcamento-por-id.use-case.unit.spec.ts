import { Types } from "mongoose";
import { BuscarOrcamentoPorIdUseCase } from "./buscar-orcamento-por-id.use-case";
import { OrcamentoMother } from "../../../../test-helpers/orcamento.mother";
import { SolicitacaoMother } from "../../../../test-helpers/solicitacao.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

describe('BuscarOrcamentoPorIdUseCase', () => {
    let useCase: BuscarOrcamentoPorIdUseCase
    let orcamentoRepoMock: ReturnType<typeof OrcamentoMother.criarRepositoryMock>
    let solicitacaoRepoMock: ReturnType<typeof SolicitacaoMother.criarRepositoryMock>

    beforeEach(() => {
        orcamentoRepoMock = OrcamentoMother.criarRepositoryMock()
        solicitacaoRepoMock = SolicitacaoMother.criarRepositoryMock()
        useCase = new BuscarOrcamentoPorIdUseCase(orcamentoRepoMock, solicitacaoRepoMock)
    })

    it('deve retornar orçamento quando ator for o prestador dono', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        const orcamento = OrcamentoMother.criarValido({ idPrestador })
        orcamentoRepoMock.buscarPorId.mockResolvedValue(orcamento)
        // Act
        const resultado = await useCase.execute('algum-id', new Types.ObjectId().toString(), idPrestador)
        // Assert
        expect(resultado).toBe(orcamento)
        expect(solicitacaoRepoMock.buscarPorId).not.toHaveBeenCalled()
    })

    it('deve retornar orçamento quando ator for o cliente dono da solicitação', async () => {
        // Arrange
        const idCliente = new Types.ObjectId().toString()
        const idPrestadorDono = new Types.ObjectId().toString()
        const orcamento = OrcamentoMother.criarValido({ idPrestador: idPrestadorDono })
        const solicitacao = SolicitacaoMother.criarValido({ idCliente })
        orcamentoRepoMock.buscarPorId.mockResolvedValue(orcamento)
        solicitacaoRepoMock.buscarPorId.mockResolvedValue(solicitacao)
        // Act
        const resultado = await useCase.execute('algum-id', idCliente, undefined)
        // Assert
        expect(resultado).toBe(orcamento)
    })

    it('deve lançar RecursoNaoEncontradoError se orçamento não existir', async () => {
        // Arrange
        orcamentoRepoMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(useCase.execute('id-inexistente', new Types.ObjectId().toString())).rejects.toThrow(RecursoNaoEncontradoError)
    })

    it('deve lançar AcessoProibidoError se ator não for dono do orçamento nem da solicitação', async () => {
        // Arrange
        const orcamento = OrcamentoMother.criarValido({ idPrestador: new Types.ObjectId().toString() })
        const solicitacao = SolicitacaoMother.criarValido({ idCliente: new Types.ObjectId().toString() })
        orcamentoRepoMock.buscarPorId.mockResolvedValue(orcamento)
        solicitacaoRepoMock.buscarPorId.mockResolvedValue(solicitacao)
        // Act & Assert
        await expect(useCase.execute('algum-id', new Types.ObjectId().toString(), new Types.ObjectId().toString()))
            .rejects.toThrow(AcessoProibidoError)
    })
})
