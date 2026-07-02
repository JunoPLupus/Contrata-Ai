import bcrypt from "bcrypt";

import { AtualizarClienteUseCase } from "./atualizar-cliente.use-case";
import { IUsuarioRepository } from "../../../../repositories/usuario.repository";
import { UsuarioMother } from "../../../../../test-helpers/usuario.mother";

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('senha_hash_mockada'),
    compare: jest.fn()
}))

describe('AtualizarClienteUseCase', () => {
    let atualizarClienteUseCase: AtualizarClienteUseCase
    let usuarioRepositoryMock: jest.Mocked<IUsuarioRepository>

    beforeEach(() => {
        jest.clearAllMocks()
        usuarioRepositoryMock = UsuarioMother.criarRepositoryMock()
        atualizarClienteUseCase = new AtualizarClienteUseCase(usuarioRepositoryMock)
    })

    it('deve atualizar os dados informados de um cliente existente', async () => {
        // Arrange
        const usuarioMock = UsuarioMother.criarUsuarioValido({ id: '507f1f77bcf86cd799439011' })
        usuarioRepositoryMock.buscarPorId.mockResolvedValue(usuarioMock)
        usuarioRepositoryMock.atualizar.mockImplementation(async usuario => usuario)
        // Act
        const clienteAtualizado = await atualizarClienteUseCase.execute('507f1f77bcf86cd799439011', {
            nome: 'Ciclano',
            telefone: '11999999999',
            whatsapp: '11999999999',
            localizacaoCidade: 'São Paulo',
            localizacaoCep: '01000-000'
        })
        // Assert
        expect(bcrypt.hash).not.toHaveBeenCalled()
        expect(clienteAtualizado.nome).toBe('Ciclano')
        expect(clienteAtualizado.telefone).toBe('11999999999')
        expect(clienteAtualizado.whatsapp).toBe('11999999999')
        expect(clienteAtualizado.localizacaoCidade).toBe('São Paulo')
        expect(clienteAtualizado.localizacaoCep).toBe('01000-000')
        expect(usuarioRepositoryMock.atualizar).toHaveBeenCalledWith(usuarioMock)
    })

    it('deve limpar telefone, whatsapp, localizacaoCidade e localizacaoCep quando enviados vazios', async () => {
        // Arrange
        const usuarioMock = UsuarioMother.criarUsuarioValido({
            id: '507f1f77bcf86cd799439011',
            telefone: '11999999999',
            whatsapp: '11999999999',
            localizacaoCidade: 'São Paulo',
            localizacaoCep: '01000-000'
        })
        usuarioRepositoryMock.buscarPorId.mockResolvedValue(usuarioMock)
        usuarioRepositoryMock.atualizar.mockImplementation(async usuario => usuario)
        // Act
        const clienteAtualizado = await atualizarClienteUseCase.execute('507f1f77bcf86cd799439011', {
            telefone: '',
            whatsapp: '',
            localizacaoCidade: '',
            localizacaoCep: ''
        })
        // Assert
        expect(clienteAtualizado.telefone).toBeUndefined()
        expect(clienteAtualizado.whatsapp).toBeUndefined()
        expect(clienteAtualizado.localizacaoCidade).toBeUndefined()
        expect(clienteAtualizado.localizacaoCep).toBeUndefined()
    })

    it.each([
        ['telefone', { telefone: '123' }, "O 'telefone' inserido é inválido. Verifique o formato e tente novamente."],
        ['whatsapp', { whatsapp: '123' }, "O 'whatsapp' inserido é inválido. Verifique o formato e tente novamente."],
        ['localizacaoCep', { localizacaoCep: '123' }, "O 'localizacaoCep' inserido é inválido. Verifique o formato e tente novamente."],
        ['localizacaoCidade muito curta', { localizacaoCidade: 'SP' }, "O campo 'localizacaoCidade' deve conter no mínimo 3 caracteres."],
        ['localizacaoCidade muito longa', { localizacaoCidade: 'A'.repeat(33) }, "O campo 'localizacaoCidade' deve conter no máximo 32 caracteres."]
    ])('deve lançar erro ao tentar atualizar com %s inválido', async (_, dadosAtualizacao, mensagemEsperada) => {
        // Arrange
        const usuarioMock = UsuarioMother.criarUsuarioValido({ id: '507f1f77bcf86cd799439011' })
        usuarioRepositoryMock.buscarPorId.mockResolvedValue(usuarioMock)
        // Act & Assert
        await expect(atualizarClienteUseCase.execute('507f1f77bcf86cd799439011', dadosAtualizacao))
            .rejects.toEqual(expect.objectContaining({ message: mensagemEsperada }))
        expect(usuarioRepositoryMock.atualizar).not.toHaveBeenCalled()
    })

    it('deve gerar o hash da senha quando ela for informada', async () => {
        // Arrange
        const usuarioMock = UsuarioMother.criarUsuarioValido({ id: '507f1f77bcf86cd799439011' })
        usuarioRepositoryMock.buscarPorId.mockResolvedValue(usuarioMock)
        usuarioRepositoryMock.atualizar.mockImplementation(async usuario => usuario)
        // Act
        const clienteAtualizado = await atualizarClienteUseCase.execute('507f1f77bcf86cd799439011', { senha: 'novaSenha123' })
        // Assert
        expect(bcrypt.hash).toHaveBeenCalledWith('novaSenha123', 10)
        expect(clienteAtualizado.senha).toBe('senha_hash_mockada')
    })

    it('deve lançar erro ao tentar atualizar com senha menor que o mínimo permitido', async () => {
        // Arrange
        const usuarioMock = UsuarioMother.criarUsuarioValido({ id: '507f1f77bcf86cd799439011' })
        usuarioRepositoryMock.buscarPorId.mockResolvedValue(usuarioMock)
        // Act & Assert
        await expect(atualizarClienteUseCase.execute('507f1f77bcf86cd799439011', { senha: '12' }))
            .rejects.toEqual(expect.objectContaining({ message: "O campo 'senha' deve conter no mínimo 6 caracteres." }))
        expect(bcrypt.hash).not.toHaveBeenCalled()
        expect(usuarioRepositoryMock.atualizar).not.toHaveBeenCalled()
    })

    it('deve lançar RecursoNaoEncontradoError quando o id não existir', async () => {
        // Arrange
        usuarioRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(atualizarClienteUseCase.execute('507f1f77bcf86cd799439011', { nome: 'Ciclano' }))
            .rejects.toEqual(expect.objectContaining({ message: 'Cliente não encontrado.' }))
        expect(usuarioRepositoryMock.atualizar).not.toHaveBeenCalled()
    })
})
