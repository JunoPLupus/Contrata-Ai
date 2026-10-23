import { Types } from "mongoose";
import { AtualizarOrcamentoUseCase } from "./atualizar-orcamento.use-case";
import { OrcamentoMother } from "../../../../test-helpers/orcamento.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";
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
        orcamentoRepoMock.buscarPorId.mockResolvedValue(orcamento)
        orcamentoRepoMock.atualizar.mockImplementation(async orcamento => orcamento)
        // Act
        const resultado = await useCase.execute('algum-id', idPrestador, { valor: 500, prazoEstimadoHoras: 720 })
        // Assert
        expect(resultado.valor).toBe(500)
        expect(resultado.prazoEstimadoHoras).toBe(720)
        expect(orcamentoRepoMock.atualizar).toHaveBeenCalledTimes(1)
    })

    it('deve lançar FormatoInvalidoError se prazoEstimadoHoras for fracionado', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        orcamentoRepoMock.buscarPorId.mockResolvedValue(OrcamentoMother.criarValido({ idPrestador }))
        // Act & Assert
        await expect(useCase.execute('algum-id', idPrestador, { prazoEstimadoHoras: 1.5 }))
            .rejects.toThrow(FormatoInvalidoError)
        expect(orcamentoRepoMock.atualizar).not.toHaveBeenCalled()
    })

    it('deve lançar OperacaoNaoPermitidaError se tentar editar o prazo com status ≠ pendente', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        orcamentoRepoMock.buscarPorId.mockResolvedValue(OrcamentoMother.criarValido({ idPrestador, status: StatusOrcamento.ACEITO }))
        // Act & Assert
        await expect(useCase.execute('algum-id', idPrestador, { prazoEstimadoHoras: 48 }))
            .rejects.toThrow(OperacaoNaoPermitidaError)
        expect(orcamentoRepoMock.atualizar).not.toHaveBeenCalled()
    })

    it('deve atualizar a descricao enquanto pendente', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        const novaDescricao = 'Inclui material e deslocamento; sem garantia.'
        orcamentoRepoMock.buscarPorId.mockResolvedValue(OrcamentoMother.criarValido({ idPrestador }))
        orcamentoRepoMock.atualizar.mockImplementation(async orcamento => orcamento)
        // Act
        const resultado = await useCase.execute('algum-id', idPrestador, { descricao: novaDescricao })
        // Assert
        expect(resultado.descricao).toBe(novaDescricao)
    })

    it('deve remover a descricao quando receber null', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        orcamentoRepoMock.buscarPorId.mockResolvedValue(OrcamentoMother.criarValido({ idPrestador, descricao: 'Descricao que sera removida' }))
        orcamentoRepoMock.atualizar.mockImplementation(async orcamento => orcamento)
        // Act
        const resultado = await useCase.execute('algum-id', idPrestador, { descricao: null })
        // Assert
        expect(resultado.descricao).toBeUndefined()
    })

    it('deve manter a descricao quando ela não for enviada', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        orcamentoRepoMock.buscarPorId.mockResolvedValue(OrcamentoMother.criarValido({ idPrestador, descricao: 'Descricao que deve ficar' }))
        orcamentoRepoMock.atualizar.mockImplementation(async orcamento => orcamento)
        // Act
        const resultado = await useCase.execute('algum-id', idPrestador, { valor: 300 })
        // Assert
        expect(resultado.descricao).toBe('Descricao que deve ficar')
    })

    it('deve lançar OperacaoNaoPermitidaError se tentar editar a descricao com status ≠ pendente', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        orcamentoRepoMock.buscarPorId.mockResolvedValue(OrcamentoMother.criarValido({ idPrestador, status: StatusOrcamento.ACEITO }))
        // Act & Assert
        await expect(useCase.execute('algum-id', idPrestador, { descricao: 'Descricao fora do prazo' }))
            .rejects.toThrow(OperacaoNaoPermitidaError)
        expect(orcamentoRepoMock.atualizar).not.toHaveBeenCalled()
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
