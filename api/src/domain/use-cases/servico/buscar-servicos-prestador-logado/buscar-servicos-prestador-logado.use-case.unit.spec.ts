import { Types } from "mongoose";

import { Servico } from "../../../entities/servico/servico.entity";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { BuscarServicosPrestadorLogadoUseCase } from "./buscar-servicos-prestador-logado.use-case";
import { ServicoMother } from "../../../../test-helpers/servico.mother";

describe('Testes unitários do Use-Case: Buscar serviços do prestador logado', () => {
    let buscarServicosPrestadorLogadoUseCase: BuscarServicosPrestadorLogadoUseCase
    let servicoRepositoryMock: jest.Mocked<IServicoRepository>
    const idPrestador = new Types.ObjectId().toString()

    beforeEach(() => {
        servicoRepositoryMock = ServicoMother.criarRepositoryMock()
        buscarServicosPrestadorLogadoUseCase = new BuscarServicosPrestadorLogadoUseCase(servicoRepositoryMock)
    })

    it('deve retornar lista de servicos do prestador logado', async () => {
        // Arrange
        const servicosMock: Servico[] = [
            ServicoMother.criarValido({ idPrestador }),
            ServicoMother.criarValido({ idPrestador })
        ]
        servicoRepositoryMock.buscarPorIdPrestador.mockResolvedValue(servicosMock)
        // Act
        const servicos = await buscarServicosPrestadorLogadoUseCase.execute(idPrestador)
        // Assert
        expect(servicoRepositoryMock.buscarPorIdPrestador).toHaveBeenCalledWith(idPrestador)
        expect(servicos).toHaveLength(2)
        expect(servicos[0]).toBeInstanceOf(Servico)
        expect(servicos.every(s => s.idPrestador === idPrestador)).toBe(true)
    })

    it('deve retornar lista vazia quando prestador nao tiver servicos', async () => {
        // Arrange
        servicoRepositoryMock.buscarPorIdPrestador.mockResolvedValue([])
        // Act
        const servicos = await buscarServicosPrestadorLogadoUseCase.execute(idPrestador)
        // Assert
        expect(servicos).toEqual([])
    })
})
