import { Types } from "mongoose";
import { BuscarPrestadoresUseCase } from "./buscar-prestadores.use-case";
import { PrestadorMother } from "../../../../test-helpers/prestador.mother";
import { PrestadorBuscaResultado } from "../../../dto/prestador/prestador-busca-resultado.dto";

const criarResultadoMock = (parcial?: Partial<PrestadorBuscaResultado>): PrestadorBuscaResultado => ({
    id: new Types.ObjectId().toString(),
    nome: 'João Silva',
    descricao: 'Eletricista residencial',
    cidade: 'São Paulo',
    ...parcial
})

describe('BuscarPrestadoresUseCase', () => {
    let useCase: BuscarPrestadoresUseCase
    let prestadorRepoMock: ReturnType<typeof PrestadorMother.criarRepositoryMock>

    beforeEach(() => {
        prestadorRepoMock = PrestadorMother.criarRepositoryMock()
        useCase = new BuscarPrestadoresUseCase(prestadorRepoMock as any)
    })

    it('deve retornar lista de prestadores sem filtros', async () => {
        // Arrange
        const resultados = [criarResultadoMock(), criarResultadoMock()]
        prestadorRepoMock.buscar.mockResolvedValue(resultados)

        // Act
        const resultado = await useCase.execute({})

        // Assert
        expect(prestadorRepoMock.buscar).toHaveBeenCalledWith({})
        expect(resultado).toHaveLength(2)
    })

    it('deve repassar filtro de idCategoria ao repositório', async () => {
        // Arrange
        const idCategoria = new Types.ObjectId().toString()
        const resultados = [criarResultadoMock()]
        prestadorRepoMock.buscar.mockResolvedValue(resultados)

        // Act
        const resultado = await useCase.execute({ idCategoria })

        // Assert
        expect(prestadorRepoMock.buscar).toHaveBeenCalledWith({ idCategoria })
        expect(resultado).toHaveLength(1)
    })

    it('deve repassar filtro de nomePrestador ao repositório', async () => {
        // Arrange
        const resultados = [criarResultadoMock({ nome: 'Carlos Ferreira' })]
        prestadorRepoMock.buscar.mockResolvedValue(resultados)

        // Act
        const resultado = await useCase.execute({ nomePrestador: 'Carlos' })

        // Assert
        expect(prestadorRepoMock.buscar).toHaveBeenCalledWith({ nomePrestador: 'Carlos' })
        expect(resultado[0].nome).toBe('Carlos Ferreira')
    })

    it('deve repassar ambos os filtros combinados ao repositório', async () => {
        // Arrange
        const idCategoria = new Types.ObjectId().toString()
        prestadorRepoMock.buscar.mockResolvedValue([criarResultadoMock()])

        // Act
        await useCase.execute({ idCategoria, nomePrestador: 'João' })

        // Assert
        expect(prestadorRepoMock.buscar).toHaveBeenCalledWith({ idCategoria, nomePrestador: 'João' })
    })

    it('deve retornar lista vazia quando nenhum prestador casar com os filtros', async () => {
        // Arrange
        prestadorRepoMock.buscar.mockResolvedValue([])

        // Act
        const resultado = await useCase.execute({ nomePrestador: 'Inexistente' })

        // Assert
        expect(resultado).toHaveLength(0)
    })
})
