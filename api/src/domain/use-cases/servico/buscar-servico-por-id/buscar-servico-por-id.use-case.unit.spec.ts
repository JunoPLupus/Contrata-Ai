import { Types } from "mongoose";

import { Servico } from "../../../entities/servico/servico.entity";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { BuscarServicoPorIdUseCase } from "./buscar-servico-por-id.use-case";
import { ServicoMother } from "../../../../test-helpers/servico.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

describe('Testes unitários do Use-Case: Buscar serviço por Id', () => {
    let buscarServicoPorIdUseCase: BuscarServicoPorIdUseCase
    let servicoRepositoryMock: jest.Mocked<IServicoRepository>

    beforeEach(() => {
        servicoRepositoryMock = ServicoMother.criarRepositoryMock()
        buscarServicoPorIdUseCase = new BuscarServicoPorIdUseCase(servicoRepositoryMock)
    })

    it('deve retornar o servico quando pertencer ao prestador logado', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        const servicoMock: Servico = ServicoMother.criarValido({ idPrestador })
        servicoRepositoryMock.buscarPorId.mockResolvedValue(servicoMock)
        // Act
        const servico = await buscarServicoPorIdUseCase.execute('qualquer-id', idPrestador)
        // Assert
        expect(servicoRepositoryMock.buscarPorId).toHaveBeenCalledWith('qualquer-id')
        expect(servico).toBeInstanceOf(Servico)
        expect(servico.idPrestador).toBe(idPrestador)
    })

    it('deve lancar RecursoNaoEncontradoError quando servico nao for encontrado', async () => {
        // Arrange
        servicoRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(
            buscarServicoPorIdUseCase.execute('id-inexistente', new Types.ObjectId().toString())
        ).rejects.toThrow(RecursoNaoEncontradoError)
    })

    it('deve lancar AcessoProibidoError quando servico nao pertencer ao prestador logado', async () => {
        // Arrange
        const idDonoPrestador = new Types.ObjectId().toString()
        const idOutroPrestador = new Types.ObjectId().toString()
        const servicoMock: Servico = ServicoMother.criarValido({ idPrestador: idDonoPrestador })
        servicoRepositoryMock.buscarPorId.mockResolvedValue(servicoMock)
        // Act & Assert
        await expect(
            buscarServicoPorIdUseCase.execute('qualquer-id', idOutroPrestador)
        ).rejects.toThrow(AcessoProibidoError)
    })
})
