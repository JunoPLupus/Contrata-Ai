import { Types } from "mongoose";

import { Servico } from "../../../entities/servico/servico.entity";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { AtivarServicoUseCase } from "./ativar-servico.use-case";
import { ServicoMother } from "../../../../test-helpers/servico.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

describe('Testes unitários do Use-Case: Ativar serviço', () => {
    let ativarServicoUseCase: AtivarServicoUseCase
    let servicoRepositoryMock: jest.Mocked<IServicoRepository>

    beforeEach(() => {
        servicoRepositoryMock = ServicoMother.criarRepositoryMock()
        ativarServicoUseCase = new AtivarServicoUseCase(servicoRepositoryMock)
    })

    it('deve ativar o servico pausado quando pertencer ao prestador logado', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        const servicoMock: Servico = ServicoMother.criarValido({ idPrestador, ativo: false })
        servicoRepositoryMock.buscarPorId.mockResolvedValue(servicoMock)
        // Act
        await ativarServicoUseCase.execute('qualquer-id', idPrestador)
        // Assert
        expect(servicoRepositoryMock.atualizar).toHaveBeenCalledWith(
            expect.objectContaining({ ativo: true })
        )
    })

    it('deve lancar RecursoNaoEncontradoError quando servico nao for encontrado', async () => {
        // Arrange
        servicoRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(
            ativarServicoUseCase.execute('id-inexistente', new Types.ObjectId().toString())
        ).rejects.toThrow(RecursoNaoEncontradoError)
        expect(servicoRepositoryMock.atualizar).not.toHaveBeenCalled()
    })

    it('deve lancar AcessoProibidoError quando servico nao pertencer ao prestador logado', async () => {
        // Arrange
        const servicoMock: Servico = ServicoMother.criarValido({ ativo: false })
        servicoRepositoryMock.buscarPorId.mockResolvedValue(servicoMock)
        // Act & Assert
        await expect(
            ativarServicoUseCase.execute('qualquer-id', new Types.ObjectId().toString())
        ).rejects.toThrow(AcessoProibidoError)
        expect(servicoRepositoryMock.atualizar).not.toHaveBeenCalled()
    })
})
