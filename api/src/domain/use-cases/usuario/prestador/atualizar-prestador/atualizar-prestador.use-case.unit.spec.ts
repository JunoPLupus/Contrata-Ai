import { AtualizarPrestadorUseCase } from "./atualizar-prestador.use-case";
import { IPrestadorRepository } from "../../../../repositories/prestador.repository";
import { PrestadorMother } from "../../../../../test-helpers/prestador.mother";

describe('AtualizarPrestadorUseCase', () => {
    let atualizarPrestadorUseCase: AtualizarPrestadorUseCase
    let prestadorRepositoryMock: jest.Mocked<IPrestadorRepository>

    beforeEach(() => {
        prestadorRepositoryMock = PrestadorMother.criarRepositoryMock()
        atualizarPrestadorUseCase = new AtualizarPrestadorUseCase(prestadorRepositoryMock)
    })

    it('deve atualizar os dados informados de um prestador existente', async () => {
        // Arrange
        const prestadorMock = PrestadorMother.criarValido({ id: '507f1f77bcf86cd799439011' })
        prestadorRepositoryMock.buscarPorId.mockResolvedValue(prestadorMock)
        prestadorRepositoryMock.atualizar.mockImplementation(async prestador => prestador)
        // Act
        const prestadorAtualizado = await atualizarPrestadorUseCase.execute('507f1f77bcf86cd799439011', {
            telefone: '11999999999',
            descricao: 'Descrição válida do prestador'
        })
        // Assert
        expect(prestadorAtualizado.telefone).toBe('11999999999')
        expect(prestadorAtualizado.descricao).toBe('Descrição válida do prestador')
        expect(prestadorRepositoryMock.atualizar).toHaveBeenCalledWith(prestadorMock)
    })

    it('deve limpar telefone e descricao quando enviados vazios', async () => {
        // Arrange
        const prestadorMock = PrestadorMother.criarValido({
            id: '507f1f77bcf86cd799439011',
            telefone: '11999999999',
            descricao: 'Descrição válida do prestador'
        })
        prestadorRepositoryMock.buscarPorId.mockResolvedValue(prestadorMock)
        prestadorRepositoryMock.atualizar.mockImplementation(async prestador => prestador)
        // Act
        const prestadorAtualizado = await atualizarPrestadorUseCase.execute('507f1f77bcf86cd799439011', {
            telefone: '',
            descricao: ''
        })
        // Assert
        expect(prestadorAtualizado.telefone).toBeUndefined()
        expect(prestadorAtualizado.descricao).toBeUndefined()
    })

    it.each([
        ['telefone', { telefone: '123' }, "O 'telefone' inserido é inválido. Verifique o formato e tente novamente."],
        ['descricao muito curta', { descricao: 'abc' }, "O campo 'descricao' deve conter no mínimo 5 caracteres."],
        ['descricao muito longa', { descricao: 'A'.repeat(501) }, "O campo 'descricao' deve conter no máximo 500 caracteres."]
    ])('deve lançar erro ao tentar atualizar com %s inválido', async (_, dadosAtualizacao, mensagemEsperada) => {
        // Arrange
        const prestadorMock = PrestadorMother.criarValido({ id: '507f1f77bcf86cd799439011' })
        prestadorRepositoryMock.buscarPorId.mockResolvedValue(prestadorMock)
        // Act & Assert
        await expect(atualizarPrestadorUseCase.execute('507f1f77bcf86cd799439011', dadosAtualizacao))
            .rejects.toEqual(expect.objectContaining({ message: mensagemEsperada }))
        expect(prestadorRepositoryMock.atualizar).not.toHaveBeenCalled()
    })

    it('deve lançar RecursoNaoEncontradoError quando o id não existir', async () => {
        // Arrange
        prestadorRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(atualizarPrestadorUseCase.execute('507f1f77bcf86cd799439011', { descricao: 'Descrição válida do prestador' }))
            .rejects.toEqual(expect.objectContaining({ message: 'Prestador não encontrado.' }))
        expect(prestadorRepositoryMock.atualizar).not.toHaveBeenCalled()
    })
})
