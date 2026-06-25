import { Types } from "mongoose";
import { BuscarContratosDoUsuarioUseCase } from "./buscar-contratos-do-usuario.use-case";
import { ContratоMother } from "../../../../test-helpers/contrato.mother";

describe('BuscarContratosDoUsuarioUseCase', () => {
    let useCase: BuscarContratosDoUsuarioUseCase
    let contratoRepoMock: ReturnType<typeof ContratоMother.criarRepositoryMock>

    beforeEach(() => {
        contratoRepoMock = ContratоMother.criarRepositoryMock()
        useCase = new BuscarContratosDoUsuarioUseCase(contratoRepoMock)
    })

    it('deve retornar contratos como cliente quando sem idPrestador', async () => {
        // Arrange
        const idCliente = new Types.ObjectId().toString()
        const contratos = [ContratоMother.criarValido({ idCliente })]
        contratoRepoMock.buscarPorIdCliente.mockResolvedValue(contratos)

        // Act
        const resultado = await useCase.execute(idCliente)

        // Assert
        expect(contratoRepoMock.buscarPorIdCliente).toHaveBeenCalledWith(idCliente)
        expect(contratoRepoMock.buscarPorIdPrestador).not.toHaveBeenCalled()
        expect(resultado).toHaveLength(1)
    })

    it('deve unificar contratos como cliente e como prestador sem duplicatas', async () => {
        // Arrange
        const idCliente = new Types.ObjectId().toString()
        const idPrestador = new Types.ObjectId().toString()
        const contratoComCliente = ContratоMother.criarValido({ idCliente })
        const contratoComPrestador = ContratоMother.criarValido({ idPrestador })

        contratoRepoMock.buscarPorIdCliente.mockResolvedValue([contratoComCliente])
        contratoRepoMock.buscarPorIdPrestador.mockResolvedValue([contratoComPrestador])

        // Act
        const resultado = await useCase.execute(idCliente, idPrestador)

        // Assert
        expect(resultado).toHaveLength(2)
    })

    it('não deve duplicar contrato que aparece nas duas listas', async () => {
        // Arrange
        const idCliente = new Types.ObjectId().toString()
        const idPrestador = new Types.ObjectId().toString()
        const contratoCompartilhado = ContratоMother.criarValido({ idCliente, idPrestador })

        contratoRepoMock.buscarPorIdCliente.mockResolvedValue([contratoCompartilhado])
        contratoRepoMock.buscarPorIdPrestador.mockResolvedValue([contratoCompartilhado])

        // Act
        const resultado = await useCase.execute(idCliente, idPrestador)

        // Assert
        expect(resultado).toHaveLength(1)
    })
})
