import { Types } from "mongoose";
import { BuscarPrestadoresPorCidadeUseCase } from "./buscar-prestadores-por-cidade.use-case";
import { PrestadorMother } from "../../../../test-helpers/prestador.mother";
import { PrestadorBuscaResultado } from "../../../dto/prestador/prestador-busca-resultado.dto";
import { CampoObrigatorioVazioError } from "../../../errors/campo-obrigatorio-vazio.error";

const criarResultadoMock = (parcial?: Partial<PrestadorBuscaResultado>): PrestadorBuscaResultado => ({
    id: new Types.ObjectId().toString(),
    nome: 'Maria Oliveira',
    descricao: 'Pintora profissional',
    cidade: 'Curitiba',
    ...parcial
})

describe('BuscarPrestadoresPorCidadeUseCase', () => {
    let useCase: BuscarPrestadoresPorCidadeUseCase
    let prestadorRepoMock: ReturnType<typeof PrestadorMother.criarRepositoryMock>

    beforeEach(() => {
        prestadorRepoMock = PrestadorMother.criarRepositoryMock()
        useCase = new BuscarPrestadoresPorCidadeUseCase(prestadorRepoMock as any)
    })

    it('deve retornar prestadores da cidade informada', async () => {
        // Arrange
        const resultados = [criarResultadoMock(), criarResultadoMock()]
        prestadorRepoMock.buscarPorCidade.mockResolvedValue(resultados)

        // Act
        const resultado = await useCase.execute('Curitiba')

        // Assert
        expect(prestadorRepoMock.buscarPorCidade).toHaveBeenCalledWith('Curitiba')
        expect(resultado).toHaveLength(2)
    })

    it('deve retornar lista vazia quando nenhum prestador estiver na cidade', async () => {
        // Arrange
        prestadorRepoMock.buscarPorCidade.mockResolvedValue([])

        // Act
        const resultado = await useCase.execute('Cidade Inexistente')

        // Assert
        expect(resultado).toHaveLength(0)
    })

    it('deve lançar CampoObrigatorioVazioError quando cidade for string vazia', async () => {
        await expect(useCase.execute('')).rejects.toThrow(CampoObrigatorioVazioError)
    })

    it('deve lançar CampoObrigatorioVazioError quando cidade for apenas espaços', async () => {
        await expect(useCase.execute('   ')).rejects.toThrow(CampoObrigatorioVazioError)
    })

    it('deve lançar CampoObrigatorioVazioError quando cidade for undefined', async () => {
        await expect(useCase.execute(undefined)).rejects.toThrow(CampoObrigatorioVazioError)
    })

    it('deve remover espaços antes de repassar a cidade ao repositório', async () => {
        // Arrange
        prestadorRepoMock.buscarPorCidade.mockResolvedValue([criarResultadoMock()])

        // Act
        await useCase.execute('  São Paulo  ')

        // Assert
        expect(prestadorRepoMock.buscarPorCidade).toHaveBeenCalledWith('São Paulo')
    })
})
