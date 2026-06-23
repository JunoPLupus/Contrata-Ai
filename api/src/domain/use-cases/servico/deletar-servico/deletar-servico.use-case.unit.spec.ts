import { Types } from "mongoose";

import { Servico } from "../../../entities/servico/servico.entity";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { DeletarServicoUseCase } from "./deletar-servico.use-case";
import { ServicoMother } from "../../../../test-helpers/servico.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

describe('Testes unitários do Use-Case: Deletar serviço', () => {
    let deletarServicoUseCase: DeletarServicoUseCase
    let servicoRepositoryMock: jest.Mocked<IServicoRepository>

    beforeEach(() => {
        servicoRepositoryMock = ServicoMother.criarRepositoryMock()
        deletarServicoUseCase = new DeletarServicoUseCase(servicoRepositoryMock)
    })

    it('deve deletar o servico quando pertencer ao prestador logado', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        const servicoMock: Servico = ServicoMother.criarValido({ idPrestador })
        servicoRepositoryMock.buscarPorId.mockResolvedValue(servicoMock)
        servicoRepositoryMock.deletar.mockResolvedValue(undefined)
        // Act
        await deletarServicoUseCase.execute('qualquer-id', idPrestador)
        // Assert
        expect(servicoRepositoryMock.buscarPorId).toHaveBeenCalledWith('qualquer-id')
        expect(servicoRepositoryMock.deletar).toHaveBeenCalledWith('qualquer-id')
    })

    it('deve lancar RecursoNaoEncontradoError quando servico nao for encontrado', async () => {
        // Arrange
        servicoRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(
            deletarServicoUseCase.execute('id-inexistente', new Types.ObjectId().toString())
        ).rejects.toThrow(RecursoNaoEncontradoError)
        expect(servicoRepositoryMock.deletar).not.toHaveBeenCalled()
    })

    it('deve lancar AcessoProibidoError quando servico nao pertencer ao prestador logado', async () => {
        // Arrange
        const idDonoPrestador = new Types.ObjectId().toString()
        const idOutroPrestador = new Types.ObjectId().toString()
        const servicoMock: Servico = ServicoMother.criarValido({ idPrestador: idDonoPrestador })
        servicoRepositoryMock.buscarPorId.mockResolvedValue(servicoMock)
        // Act & Assert
        await expect(
            deletarServicoUseCase.execute('qualquer-id', idOutroPrestador)
        ).rejects.toThrow(AcessoProibidoError)
        expect(servicoRepositoryMock.deletar).not.toHaveBeenCalled()
    })
})
