import { Types } from "mongoose";
import { AtualizarOrcamentoUseCase } from "./atualizar-orcamento.use-case";
import { OrcamentoMother } from "../../../../test-helpers/orcamento.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { StatusOrcamento } from "../../../value-objects/orcamento/status/status.vo";

describe('AtualizarOrcamentoUseCase', () => {
    let useCase: AtualizarOrcamentoUseCase
    let orcamentoRepoMock: ReturnType<typeof OrcamentoMother.criarRepositoryMock>

    beforeEach(() => {
        orcamentoRepoMock = OrcamentoMother.criarRepositoryMock()
        useCase = new AtualizarOrcamentoUseCase(orcamentoRepoMock)
    })

    it('deve atualizar valor e prazo enquanto pendente', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        const orcamento = OrcamentoMother.criarValido({ idPrestador })
        const orcamentoAtualizado = OrcamentoMother.criarValido({ idPrestador, valor: 500, prazoDias: 30 })
        orcamentoRepoMock.buscarPorId.mockResolvedValue(orcamento)
        orcamentoRepoMock.atualizar.mockResolvedValue(orcamentoAtualizado)
        // Act
        const resultado = await useCase.execute('algum-id', idPrestador, { valor: 500, prazoDias: 30 })
        // Assert
        expect(resultado).toBe(orcamentoAtualizado)
        expect(orcamentoRepoMock.atualizar).toHaveBeenCalledTimes(1)
    })

    it('deve transicionar pendente → cancelado com sucesso', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        const orcamento = OrcamentoMother.criarValido({ idPrestador })
        orcamentoRepoMock.buscarPorId.mockResolvedValue(orcamento)
        orcamentoRepoMock.atualizar.mockResolvedValue(orcamento)
        // Act
        await useCase.execute('algum-id', idPrestador, { status: StatusOrcamento.CANCELADO })
        // Assert
        expect(orcamento.status).toBe(StatusOrcamento.CANCELADO)
    })

    it('deve lançar OperacaoNaoPermitidaError se tentar editar com status ≠ pendente', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        const orcamento = OrcamentoMother.criarValido({ idPrestador, status: StatusOrcamento.ACEITO })
        orcamentoRepoMock.buscarPorId.mockResolvedValue(orcamento)
        // Act & Assert
        await expect(useCase.execute('algum-id', idPrestador, { valor: 200 }))
            .rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar OperacaoNaoPermitidaError para transição de status inválida', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        const orcamento = OrcamentoMother.criarValido({ idPrestador })
        orcamentoRepoMock.buscarPorId.mockResolvedValue(orcamento)
        // Act & Assert
        await expect(useCase.execute('algum-id', idPrestador, { status: StatusOrcamento.ACEITO }))
            .rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar AcessoProibidoError se orçamento pertencer a outro prestador', async () => {
        // Arrange
        const outroPrestador = new Types.ObjectId().toString()
        const orcamento = OrcamentoMother.criarValido({ idPrestador: outroPrestador })
        orcamentoRepoMock.buscarPorId.mockResolvedValue(orcamento)
        // Act & Assert
        await expect(useCase.execute('algum-id', new Types.ObjectId().toString(), { valor: 100 }))
            .rejects.toThrow(AcessoProibidoError)
    })

    it('deve lançar RecursoNaoEncontradoError se orçamento não existir', async () => {
        // Arrange
        orcamentoRepoMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(useCase.execute('id-inexistente', new Types.ObjectId().toString(), {}))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })
})
