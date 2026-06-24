import { Types } from "mongoose";

import { BuscarSolicitacoesClienteLogadoUseCase } from "./buscar-solicitacoes-cliente-logado.use-case";
import { ISolicitacaoRepository } from "../../../repositories/solicitacao.repository";
import { Solicitacao } from "../../../entities/solicitacao/solicitacao.entity";
import { SolicitacaoMother } from "../../../../test-helpers/solicitacao.mother";

describe('Testes unitários do Use-Case: Buscar Solicitações do Cliente Logado', () => {
    let useCase: BuscarSolicitacoesClienteLogadoUseCase
    let solicitacaoRepositoryMock: jest.Mocked<ISolicitacaoRepository>
    let idCliente : string

    beforeEach(() => {
        solicitacaoRepositoryMock = SolicitacaoMother.criarRepositoryMock()
        useCase = new BuscarSolicitacoesClienteLogadoUseCase(solicitacaoRepositoryMock)

        idCliente = new Types.ObjectId().toString()
    })

    it('deve retornar lista de solicitações do cliente', async () => {
        // Arrange
        const solicitacoesMock = [
            SolicitacaoMother.criarValido({ idCliente }),
            SolicitacaoMother.criarValido({ idCliente })
        ]
        solicitacaoRepositoryMock.buscarPorIdCliente.mockResolvedValue(solicitacoesMock)
        // Act
        const resultado = await useCase.execute(idCliente)
        // Assert
        expect(solicitacaoRepositoryMock.buscarPorIdCliente).toHaveBeenCalledWith(idCliente)
        expect(resultado).toHaveLength(2)
        expect(resultado.every(s => s instanceof Solicitacao)).toBe(true)
    })

    it('deve retornar array vazio quando cliente não tiver solicitações', async () => {
        // Arrange
        solicitacaoRepositoryMock.buscarPorIdCliente.mockResolvedValue([])
        // Act
        const resultado = await useCase.execute(idCliente)
        // Assert
        expect(resultado).toHaveLength(0)
    })
})
