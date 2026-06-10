import { CadastrarPrestadorUseCase } from "./cadastrar-prestador.use-case";
import { IPrestadorRepository } from "../../../../repositories/prestador.repository";
import { IUsuarioRepository } from "../../../../repositories/usuario.repository";
import { Prestador } from "../../../../entities/prestador/prestador.entity";
import { PrestadorMother } from "../../../../../test-helpers/prestador.mother";
import {UsuarioMother} from "../../../../../test-helpers/usuario.mother";

describe('CadastrarPrestadorUseCase', () => {
    let cadastrarPrestadorUseCase : CadastrarPrestadorUseCase
    let prestadorRepositoryMock: jest.Mocked<IPrestadorRepository>
    let usuarioRepositoryMock: jest.Mocked<IUsuarioRepository>

    beforeEach(() => {
        prestadorRepositoryMock = {
            inserir : jest.fn()
        }
        usuarioRepositoryMock = UsuarioMother.criarRepositoryMock()
        cadastrarPrestadorUseCase = new CadastrarPrestadorUseCase(prestadorRepositoryMock, usuarioRepositoryMock)
    })

    it('deve criar um prestador com dados válidos e vincular ao usuário', async () => {
        // Arrange
        const dtoMock = PrestadorMother.criarDTO()
        const prestadorMock : Prestador = PrestadorMother.criarValido(dtoMock)
        prestadorRepositoryMock.inserir.mockResolvedValue(prestadorMock)
        usuarioRepositoryMock.vincularPrestador.mockResolvedValue()
        // Act
        const prestadorCriado = await cadastrarPrestadorUseCase.execute(dtoMock)
        // Assert
        expect(prestadorRepositoryMock.inserir).toHaveBeenCalled()
        expect(usuarioRepositoryMock.vincularPrestador).toHaveBeenCalledWith(dtoMock.idCliente, prestadorMock.id)
        expect(prestadorCriado).not.toBeNull()
        expect(prestadorCriado).toBeInstanceOf(Prestador)
        expect(prestadorCriado.idCliente).toEqual(dtoMock.idCliente)
    })

    it.each([
        ['vazio', { idCliente : ''}],
        ['só espaços', { idCliente : '   '}],
    ])('deve lançar erro quando o id de cliente for %s', async (_, prestadorInvalido) => {
        await expect(
            cadastrarPrestadorUseCase.execute(prestadorInvalido))
            .rejects.toThrow(
                expect.objectContaining({ message: "O campo 'idCliente' é obrigatório." }))
    })
})