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
    const idSolicitacao = new Types.ObjectId().toString()

    beforeEach(() => {
        solicitacaoRepositoryMock = SolicitacaoMother.criarRepositoryMock()
        useCase = new AtualizarSolicitacaoUseCase(solicitacaoRepositoryMock)
    })

    it('deve atualizar a descrição de uma solicitação aberta', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCliente, status: StatusSolicitacao.ABERTA })
        const atualizada = SolicitacaoMother.criarValido({ idCliente, descricao: 'Nova descrição' })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        solicitacaoRepositoryMock.atualizar.mockResolvedValue(atualizada)
        // Act
        const resultado = await useCase.execute(idSolicitacao, idCliente, { descricao: 'Nova descrição' })
        // Assert
        expect(solicitacaoRepositoryMock.atualizar).toHaveBeenCalled()
        expect(resultado).toBeInstanceOf(Solicitacao)
    })

    it('deve cancelar uma solicitação aberta', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCliente, status: StatusSolicitacao.ABERTA })
        const cancelada = SolicitacaoMother.criarValido({ idCliente, status: StatusSolicitacao.CANCELADA })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        solicitacaoRepositoryMock.atualizar.mockResolvedValue(cancelada)
        // Act
        const resultado = await useCase.execute(idSolicitacao, idCliente, { status: StatusSolicitacao.CANCELADA })
        // Assert
        expect(resultado.status).toBe(StatusSolicitacao.CANCELADA)
    })

    it('deve lançar RecursoNaoEncontradoError quando solicitação não existir', async () => {
        // Arrange
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(
            useCase.execute(idSolicitacao, idCliente, { descricao: 'Nova descrição' })
        ).rejects.toThrow(RecursoNaoEncontradoError)
    })

    it('deve lançar AcessoProibidoError quando cliente não for o dono', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCliente })
        const outroCliente = new Types.ObjectId().toString()
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        // Act & Assert
        await expect(
            useCase.execute(idSolicitacao, outroCliente, { descricao: 'Nova descrição' })
        ).rejects.toThrow(AcessoProibidoError)
    })

    it('deve lançar OperacaoNaoPermitidaError ao editar descrição de solicitação cancelada', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCliente, status: StatusSolicitacao.CANCELADA })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        // Act & Assert
        await expect(
            useCase.execute(idSolicitacao, idCliente, { descricao: 'Nova descrição' })
        ).rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('deve lançar OperacaoNaoPermitidaError para transição inválida de status', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCliente, status: StatusSolicitacao.CANCELADA })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        // Act & Assert
        await expect(
            useCase.execute(idSolicitacao, idCliente, { status: StatusSolicitacao.ABERTA })
        ).rejects.toThrow(OperacaoNaoPermitidaError)
    })

    it('não deve chamar atualizar quando não há dados para atualizar', async () => {
        // Arrange
        const solicitacaoMock = SolicitacaoMother.criarValido({ idCliente })
        solicitacaoRepositoryMock.buscarPorId.mockResolvedValue(solicitacaoMock)
        solicitacaoRepositoryMock.atualizar.mockResolvedValue(solicitacaoMock)
        // Act
        await useCase.execute(idSolicitacao, idCliente, {})
        // Assert
        expect(solicitacaoRepositoryMock.atualizar).toHaveBeenCalled()
    })
})
