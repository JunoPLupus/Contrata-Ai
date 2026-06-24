import { Types } from "mongoose";

import { CadastrarSolicitacaoUseCase } from "./cadastrar-solicitacao.use-case";
import { ISolicitacaoRepository } from "../../../repositories/solicitacao.repository";
import { ICategoriaRepository } from "../../../repositories/categoria.repository";
import { IPrestadorRepository } from "../../../repositories/prestador.repository";
import { Solicitacao } from "../../../entities/solicitacao/solicitacao.entity";
import { SolicitacaoMother } from "../../../../test-helpers/solicitacao.mother";
import { CategoriaMother } from "../../../../test-helpers/categoria.mother";
import { PrestadorMother } from "../../../../test-helpers/prestador.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";

describe('Testes unitários do Use-Case: Cadastrar Solicitação', () => {
    let useCase: CadastrarSolicitacaoUseCase
    let solicitacaoRepositoryMock: jest.Mocked<ISolicitacaoRepository>
    let categoriaRepositoryMock: jest.Mocked<ICategoriaRepository>
    let prestadorRepositoryMock: jest.Mocked<IPrestadorRepository>

    beforeEach(() => {
        solicitacaoRepositoryMock = SolicitacaoMother.criarRepositoryMock()
        categoriaRepositoryMock = CategoriaMother.criarRepositoryMock()
        prestadorRepositoryMock = PrestadorMother.criarRepositoryMock()
        useCase = new CadastrarSolicitacaoUseCase(
            solicitacaoRepositoryMock,
            categoriaRepositoryMock,
            prestadorRepositoryMock
        )
    })

    it('deve cadastrar uma solicitação geral com dados válidos', async () => {
        // Arrange
        const dto = SolicitacaoMother.criarDTO()
        const solicitacaoMock = SolicitacaoMother.criarValido(dto)
        categoriaRepositoryMock.buscarPorId.mockResolvedValue(CategoriaMother.criarValido())
        solicitacaoRepositoryMock.inserir.mockResolvedValue(solicitacaoMock)
        // Act
        const resultado = await useCase.execute(dto)
        // Assert
        expect(categoriaRepositoryMock.buscarPorId).toHaveBeenCalledWith(dto.idCategoria)
        expect(solicitacaoRepositoryMock.inserir).toHaveBeenCalled()
        expect(resultado).toBeInstanceOf(Solicitacao)
        expect(resultado.idCliente).toBe(dto.idCliente)
        expect(resultado.status).toBe('aberta')
    })

    it('deve cadastrar uma solicitação direta com prestador válido', async () => {
        // Arrange
        const idPrestadorDireto = new Types.ObjectId().toString()
        const dto = SolicitacaoMother.criarDTO({ idPrestadorDireto })
        const solicitacaoMock = SolicitacaoMother.criarValido({ ...dto, idPrestadorDireto })
        categoriaRepositoryMock.buscarPorId.mockResolvedValue(CategoriaMother.criarValido())
        prestadorRepositoryMock.buscarPorId.mockResolvedValue(PrestadorMother.criarValido())
        solicitacaoRepositoryMock.inserir.mockResolvedValue(solicitacaoMock)
        // Act
        const resultado = await useCase.execute(dto)
        // Assert
        expect(prestadorRepositoryMock.buscarPorId).toHaveBeenCalledWith(idPrestadorDireto)
        expect(resultado).toBeInstanceOf(Solicitacao)
    })

    it('deve lançar RecursoNaoEncontradoError quando categoria não existir', async () => {
        // Arrange
        const dto = SolicitacaoMother.criarDTO()
        categoriaRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(useCase.execute(dto)).rejects.toThrow(RecursoNaoEncontradoError)
        expect(solicitacaoRepositoryMock.inserir).not.toHaveBeenCalled()
    })

    it('deve lançar RecursoNaoEncontradoError quando prestador direto não existir', async () => {
        // Arrange
        const dto = SolicitacaoMother.criarDTO({ idPrestadorDireto: new Types.ObjectId().toString() })
        categoriaRepositoryMock.buscarPorId.mockResolvedValue(CategoriaMother.criarValido())
        prestadorRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(useCase.execute(dto)).rejects.toThrow(RecursoNaoEncontradoError)
        expect(solicitacaoRepositoryMock.inserir).not.toHaveBeenCalled()
    })
})
