import { Types } from "mongoose";

import { AtualizarSolicitacaoUseCase } from "./atualizar-solicitacao.use-case";
import { ISolicitacaoRepository } from "../../../repositories/solicitacao.repository";
import { Solicitacao } from "../../../entities/solicitacao/solicitacao.entity";
import { SolicitacaoMother } from "../../../../test-helpers/solicitacao.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { StatusSolicitacao } from "../../../value-objects/solicitacao/status/status.vo";

describe('Testes unitários do Use-Case: Atualizar Solicitação', () => {
    let useCase: AtualizarSolicitacaoUseCase
    let solicitacaoRepositoryMock: jest.Mocked<ISolicitacaoRepository>

    const idCliente = new Types.ObjectId().toString()

    beforeEach(() => {
        solicitacaoRepositoryMock = SolicitacaoMother.criarRepositoryMock()
        useCase = new AtualizarSolicitacaoUseCase(solicitacaoRepositoryMock)
    })

    it('deve atualizar descrição de solicitação com status aberta', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCliente, status: StatusSolicitacao.ABERTA })
        const solicitacaoAtualizada = SolicitacaoMother.criarValido({ idCliente, descricao: 'Nova descricao valida aqui' })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        solicitacaoRepositoryMock.atualizar.mockResolvedValue(solicitacaoAtualizada)
        // Act
        const resultado = await useCase.execute(
            new Types.ObjectId().toString(),
            idCliente,
            { descricao: 'Nova descricao valida aqui' }
        )
        // Assert
        expect(solicitacaoRepositoryMock.atualizar).toHaveBeenCalled()
        expect(resultado).toBeInstanceOf(Solicitacao)
    })

    it('deve cancelar solicitação com status aberta', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCliente, status: StatusSolicitacao.ABERTA })
        const solicitacaoCancelada = SolicitacaoMother.criarValido({ idCliente, status: StatusSolicitacao.CANCELADA })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        solicitacaoRepositoryMock.atualizar.mockResolvedValue(solicitacaoCancelada)
        // Act
        const resultado = await useCase.execute(
            new Types.ObjectId().toString(),
            idCliente,
            { status: StatusSolicitacao.CANCELADA }
        )
        // Assert
        expect(resultado).toBeInstanceOf(Solicitacao)
    })

    it('deve lançar RecursoNaoEncontradoError quando solicitação não existir', async () => {
        // Arrange
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(
            useCase.execute(new Types.ObjectId().toString(), idCliente, { descricao: 'Nova descricao' })
        ).rejects.toThrow(RecursoNaoEncontradoError)
        expect(solicitacaoRepositoryMock.atualizar).not.toHaveBeenCalled()
    })

    it('deve lançar AcessoProibidoError quando cliente não for dono', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCliente })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        // Act & Assert
        await expect(
            useCase.execute(new Types.ObjectId().toString(), new Types.ObjectId().toString(), { descricao: 'Nova descricao' })
        ).rejects.toThrow(AcessoProibidoError)
    })

    it('deve lançar OperacaoNaoPermitidaError ao editar descrição com status cancelada', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCliente, status: StatusSolicitacao.CANCELADA })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        // Act & Assert
        await expect(
            useCase.execute(new Types.ObjectId().toString(), idCliente, { descricao: 'Tentativa invalida' })
        ).rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar OperacaoNaoPermitidaError ao editar descrição com status encerrada', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCliente, status: StatusSolicitacao.ENCERRADA })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        // Act & Assert
        await expect(
            useCase.execute(new Types.ObjectId().toString(), idCliente, { descricao: 'Tentativa invalida' })
        ).rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar OperacaoNaoPermitidaError para transição de status inválida (cancelada → aberta)', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCliente, status: StatusSolicitacao.CANCELADA })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        // Act & Assert
        await expect(
            useCase.execute(new Types.ObjectId().toString(), idCliente, { status: StatusSolicitacao.ABERTA })
        ).rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar OperacaoNaoPermitidaError para transição de status inválida (encerrada → cancelada)', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCliente, status: StatusSolicitacao.ENCERRADA })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        // Act & Assert
        await expect(
            useCase.execute(new Types.ObjectId().toString(), idCliente, { status: StatusSolicitacao.CANCELADA })
        ).rejects.toThrow(OperacaoNaoPermitidaError)
    })
})
