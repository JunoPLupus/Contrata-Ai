import { Types } from "mongoose";

import { Servico } from "../../../entities/servico/servico.entity";
import { Solicitacao } from "../../../entities/solicitacao/solicitacao.entity";
import { ISolicitacaoRepository } from "../../../repositories/solicitacao.repository";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { BuscarSolicitacoesDisponiveisPrestadorUseCase } from "./buscar-solicitacoes-disponiveis-prestador.use-case";
import { SolicitacaoMother } from "../../../../test-helpers/solicitacao.mother";
import { ServicoMother } from "../../../../test-helpers/servico.mother";

describe('Testes unitários do Use-Case: Buscar Solicitações Disponíveis para Prestador', () => {
    let useCase: BuscarSolicitacoesDisponiveisPrestadorUseCase
    let solicitacaoRepositoryMock: jest.Mocked<ISolicitacaoRepository>
    let servicoRepositoryMock: jest.Mocked<IServicoRepository>
    let servico : Servico

    const idPrestador = new Types.ObjectId().toString()
    const idCategoria = new Types.ObjectId().toString()

    beforeEach(() => {
        solicitacaoRepositoryMock = SolicitacaoMother.criarRepositoryMock()
        servicoRepositoryMock = ServicoMother.criarRepositoryMock()
        useCase = new BuscarSolicitacoesDisponiveisPrestadorUseCase(
            solicitacaoRepositoryMock,
            servicoRepositoryMock
        )

        servico = ServicoMother.criarValido({ idPrestador, idCategoria })
    })

    it('deve buscar todas as solicitações disponíveis sem filtro de categoria', async () => {
        // Arrange
        const solicitacoesMock = [SolicitacaoMother.criarValido({ idCategoria })]
        servicoRepositoryMock.buscarPorIdPrestador.mockResolvedValue([servico])
        solicitacaoRepositoryMock.buscarDisponiveisParaPrestador.mockResolvedValue(solicitacoesMock)
        // Act
        const resultado = await useCase.execute(idPrestador)
        // Assert
        expect(servicoRepositoryMock.buscarPorIdPrestador).toHaveBeenCalledWith(idPrestador)
        expect(solicitacaoRepositoryMock.buscarDisponiveisParaPrestador).toHaveBeenCalledWith(
            idPrestador,
            [idCategoria],
            undefined
        )
        expect(resultado).toHaveLength(1)
        expect(resultado[0]).toBeInstanceOf(Solicitacao)
    })

    it('deve buscar solicitações disponíveis com filtro de categoria específica', async () => {
        // Arrange
        servicoRepositoryMock.buscarPorIdPrestador.mockResolvedValue([servico])
        solicitacaoRepositoryMock.buscarDisponiveisParaPrestador.mockResolvedValue([])
        // Act
        const resultado = await useCase.execute(idPrestador, idCategoria)
        // Assert
        expect(solicitacaoRepositoryMock.buscarDisponiveisParaPrestador).toHaveBeenCalledWith(
            idPrestador,
            [idCategoria],
            idCategoria
        )
        expect(resultado).toHaveLength(0)
    })

    it('deve deduplicar categorias dos serviços do prestador', async () => {
        // Arrange
        const servico1 = ServicoMother.criarValido({ idPrestador, idCategoria })
        const servico2 = ServicoMother.criarValido({ idPrestador, idCategoria })
        servicoRepositoryMock.buscarPorIdPrestador.mockResolvedValue([servico1, servico2])
        solicitacaoRepositoryMock.buscarDisponiveisParaPrestador.mockResolvedValue([])
        // Act
        await useCase.execute(idPrestador)
        // Assert — categoria duplicada deve aparecer apenas uma vez
        expect(solicitacaoRepositoryMock.buscarDisponiveisParaPrestador).toHaveBeenCalledWith(
            idPrestador,
            [idCategoria],
            undefined
        )
    })

    it('deve retornar array vazio quando prestador não tiver serviços', async () => {
        // Arrange
        servicoRepositoryMock.buscarPorIdPrestador.mockResolvedValue([])
        solicitacaoRepositoryMock.buscarDisponiveisParaPrestador.mockResolvedValue([])
        // Act
        const resultado = await useCase.execute(idPrestador)
        // Assert
        expect(resultado).toHaveLength(0)
    })
})
