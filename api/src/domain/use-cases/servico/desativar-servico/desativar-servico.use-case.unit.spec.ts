import { Types } from "mongoose";

import { Servico } from "../../../entities/servico/servico.entity";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { DesativarServicoUseCase } from "./desativar-servico.use-case";
import { ServicoMother } from "../../../../test-helpers/servico.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

describe('Testes unitários do Use-Case: Desativar serviço', () => {
    let desativarServicoUseCase: DesativarServicoUseCase
    let servicoRepositoryMock: jest.Mocked<IServicoRepository>

    beforeEach(() => {
        servicoRepositoryMock = ServicoMother.criarRepositoryMock()
        desativarServicoUseCase = new DesativarServicoUseCase(servicoRepositoryMock)
    })

    it('deve desativar o servico quando pertencer ao prestador logado', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        const servicoMock: Servico = ServicoMother.criarValido({ idPrestador })
        servicoRepositoryMock.buscarPorId.mockResolvedValue(servicoMock)
        // Act
        await desativarServicoUseCase.execute('qualquer-id', idPrestador)
        // Assert
        expect(servicoRepositoryMock.atualizar).toHaveBeenCalledWith(
            expect.objectContaining({ ativo: false })
        )
        expect(servicoMock.estaOfertado()).toBe(false)
    })

    it('deve lancar RecursoNaoEncontradoError quando servico nao for encontrado', async () => {
        // Arrange
        servicoRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(
            desativarServicoUseCase.execute('id-inexistente', new Types.ObjectId().toString())
        ).rejects.toThrow(RecursoNaoEncontradoError)
        expect(servicoRepositoryMock.atualizar).not.toHaveBeenCalled()
    })

    it('deve lancar AcessoProibidoError quando servico nao pertencer ao prestador logado', async () => {
        // Arrange
        const servicoMock: Servico = ServicoMother.criarValido()
        servicoRepositoryMock.buscarPorId.mockResolvedValue(servicoMock)
        // Act & Assert
        await expect(
            desativarServicoUseCase.execute('qualquer-id', new Types.ObjectId().toString())
        ).rejects.toThrow(AcessoProibidoError)
        expect(servicoRepositoryMock.atualizar).not.toHaveBeenCalled()
    })
})
