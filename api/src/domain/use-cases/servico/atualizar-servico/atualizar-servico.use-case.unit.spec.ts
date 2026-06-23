import { Types } from "mongoose";

import { Servico } from "../../../entities/servico/servico.entity";
import { ServicoAtualizacaoDTO } from "../../../dto/servico/servico-atualizacao.dto";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { AtualizarServicoUseCase } from "./atualizar-servico.use-case";
import { ServicoMother } from "../../../../test-helpers/servico.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

describe('Testes unitários do Use-Case: Atualizar Serviço', () => {
    let atualizarServicoUseCase: AtualizarServicoUseCase
    let servicoRepositoryMock: jest.Mocked<IServicoRepository>

    beforeEach(() => {
        servicoRepositoryMock = ServicoMother.criarRepositoryMock()
        atualizarServicoUseCase = new AtualizarServicoUseCase(servicoRepositoryMock)
    })

    it('deve atualizar e retornar o servico com os dados fornecidos', async () => {
        // Arrange
        const idPrestador = new Types.ObjectId().toString()
        const servicoMock: Servico = ServicoMother.criarValido({ idPrestador })
        const dtoAtualizacao: ServicoAtualizacaoDTO = { descricao: 'Nova descricao do servico atualizado' }
        const servicoAtualizado: Servico = ServicoMother.criarValido({ idPrestador, descricao: dtoAtualizacao.descricao })
        servicoRepositoryMock.buscarPorId.mockResolvedValue(servicoMock)
        servicoRepositoryMock.atualizar.mockResolvedValue(servicoAtualizado)
        // Act
        const resultado = await atualizarServicoUseCase.execute('qualquer-id', idPrestador, dtoAtualizacao)
        // Assert
        expect(servicoRepositoryMock.buscarPorId).toHaveBeenCalledWith('qualquer-id')
        expect(servicoRepositoryMock.atualizar).toHaveBeenCalled()
        expect(resultado).toBeInstanceOf(Servico)
        expect(resultado.descricao).toBe(dtoAtualizacao.descricao)
    })

    it('deve lancar RecursoNaoEncontradoError quando servico nao for encontrado', async () => {
        // Arrange
        servicoRepositoryMock.buscarPorId.mockResolvedValue(null)
        // Act & Assert
        await expect(
            atualizarServicoUseCase.execute('id-inexistente', new Types.ObjectId().toString(), {})
        ).rejects.toThrow(RecursoNaoEncontradoError)
        expect(servicoRepositoryMock.atualizar).not.toHaveBeenCalled()
    })

    it('deve lancar AcessoProibidoError quando servico nao pertencer ao prestador logado', async () => {
        // Arrange
        const idDonoPrestador = new Types.ObjectId().toString()
        const idOutroPrestador = new Types.ObjectId().toString()
        const servicoMock: Servico = ServicoMother.criarValido({ idPrestador: idDonoPrestador })
        servicoRepositoryMock.buscarPorId.mockResolvedValue(servicoMock)
        // Act & Assert
        await expect(
            atualizarServicoUseCase.execute('qualquer-id', idOutroPrestador, { descricao: 'Tentativa indevida' })
        ).rejects.toThrow(AcessoProibidoError)
        expect(servicoRepositoryMock.atualizar).not.toHaveBeenCalled()
    })
})
