import { Types } from "mongoose";
import { CadastrarAvaliacaoUseCase } from "./cadastrar-avaliacao.use-case";
import { AvaliacaoMother } from "../../../../test-helpers/avaliacao.mother";
import { ContratоMother } from "../../../../test-helpers/contrato.mother";
import { StatusContrato } from "../../../value-objects/contrato/status/status.vo";
import { Papel } from "../../../value-objects/shared/papel/papel.vo";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";

describe('CadastrarAvaliacaoUseCase', () => {
    let useCase: CadastrarAvaliacaoUseCase
    let avaliacaoRepoMock: ReturnType<typeof AvaliacaoMother.criarRepositoryMock>
    let contratoRepoMock: ReturnType<typeof ContratоMother.criarRepositoryMock>

    const idCliente = new Types.ObjectId().toString()
    const idPrestador = new Types.ObjectId().toString()
    const idContrato = new Types.ObjectId().toString()
    const idQualquer = () => new Types.ObjectId().toString()

    beforeEach(() => {
        avaliacaoRepoMock = AvaliacaoMother.criarRepositoryMock()
        contratoRepoMock = ContratоMother.criarRepositoryMock()
        avaliacaoRepoMock.inserir.mockImplementation(async (avaliacao) => avaliacao)
        useCase = new CadastrarAvaliacaoUseCase(avaliacaoRepoMock as any, contratoRepoMock as any)
    })

    const contratoConcluido = () =>
        ContratоMother.criarValido({ id: idContrato, idCliente, idPrestador, status: StatusContrato.CONCLUIDO })

    describe('dedução do autor', () => {
        it('deve cadastrar com autor "cliente" quando o cliente do contrato avaliar', async () => {
            // Arrange
            contratoRepoMock.buscarPorId.mockResolvedValue(contratoConcluido())

            // Act
            const resultado = await useCase.execute({ idContrato, nota: 4, comentario: 'Ótimo', anonima: true }, idCliente)

            // Assert
            expect(avaliacaoRepoMock.inserir).toHaveBeenCalledTimes(1)
            const inserida = avaliacaoRepoMock.inserir.mock.calls[0][0]
            expect(inserida.autor).toBe(Papel.CLIENTE)
            expect(inserida.idContrato).toBe(idContrato)
            expect(inserida.idCliente).toBe(idCliente)
            expect(inserida.idPrestador).toBe(idPrestador)
            expect(inserida.nota).toBe(4)
            expect(inserida.comentario).toBe('Ótimo')
            expect(inserida.anonima).toBe(true)
            expect(resultado).toBe(inserida)
        })

        it('deve cadastrar com autor "cliente" quando o cliente do contrato também tiver perfil de prestador (de outro contrato)', async () => {
            // Arrange
            contratoRepoMock.buscarPorId.mockResolvedValue(contratoConcluido())

            // Act
            await useCase.execute({ idContrato, nota: 5 }, idCliente, idQualquer())

            // Assert
            expect(avaliacaoRepoMock.inserir.mock.calls[0][0].autor).toBe(Papel.CLIENTE)
        })

        it('deve cadastrar com autor "prestador" quando o prestador do contrato avaliar', async () => {
            // Arrange
            contratoRepoMock.buscarPorId.mockResolvedValue(contratoConcluido())
            const idClienteDoPrestador = idQualquer()

            // Act
            await useCase.execute({ idContrato, nota: 3 }, idClienteDoPrestador, idPrestador)

            // Assert
            const inserida = avaliacaoRepoMock.inserir.mock.calls[0][0]
            expect(inserida.autor).toBe(Papel.PRESTADOR)
            expect(inserida.idCliente).toBe(idCliente)
            expect(inserida.idPrestador).toBe(idPrestador)
        })

        it('deve lançar AcessoProibidoError se o usuário não for parte do contrato', async () => {
            // Arrange
            contratoRepoMock.buscarPorId.mockResolvedValue(contratoConcluido())

            // Act & Assert
            await expect(useCase.execute({ idContrato, nota: 5 }, idQualquer(), idQualquer()))
                .rejects.toThrow(AcessoProibidoError)
            expect(avaliacaoRepoMock.inserir).not.toHaveBeenCalled()
        })

        it('deve lançar AcessoProibidoError se o usuário sem perfil de prestador não for o cliente do contrato', async () => {
            // Arrange
            contratoRepoMock.buscarPorId.mockResolvedValue(contratoConcluido())

            // Act & Assert
            await expect(useCase.execute({ idContrato, nota: 5 }, idQualquer()))
                .rejects.toThrow(AcessoProibidoError)
        })

        it('deve recusar auto-avaliação quando o usuário for o cliente e o prestador do contrato', async () => {
            // Arrange
            contratoRepoMock.buscarPorId.mockResolvedValue(contratoConcluido())

            // Act & Assert
            await expect(useCase.execute({ idContrato, nota: 5 }, idCliente, idPrestador))
                .rejects.toThrow(new OperacaoNaoPermitidaError('Não é permitido avaliar um contrato em que você é o cliente e o prestador.'))
            expect(avaliacaoRepoMock.inserir).not.toHaveBeenCalled()
        })
    })

    it('deve lançar RecursoNaoEncontradoError se o contrato não existir', async () => {
        // Arrange
        contratoRepoMock.buscarPorId.mockResolvedValue(null)

        // Act & Assert
        await expect(useCase.execute({ idContrato, nota: 5 }, idCliente))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })

    it.each([
        StatusContrato.AGUARDANDO_INICIO,
        StatusContrato.EM_ANDAMENTO,
        StatusContrato.AGUARDANDO_CONFIRMACAO,
        StatusContrato.CANCELADO,
    ])('deve lançar OperacaoNaoPermitidaError se o contrato estiver "%s"', async (status) => {
        // Arrange
        contratoRepoMock.buscarPorId.mockResolvedValue(ContratоMother.criarValido({ idCliente, idPrestador, status }))

        // Act & Assert
        await expect(useCase.execute({ idContrato, nota: 5 }, idCliente))
            .rejects.toThrow(new OperacaoNaoPermitidaError('A avaliação só é liberada após a conclusão do serviço.'))
    })

    it('não deve consultar avaliação existente antes de inserir (unicidade fica com o índice — ADR 010)', async () => {
        // Arrange
        contratoRepoMock.buscarPorId.mockResolvedValue(contratoConcluido())

        // Act
        await useCase.execute({ idContrato, nota: 5 }, idCliente)

        // Assert
        expect(avaliacaoRepoMock.buscarPorIdContrato).not.toHaveBeenCalled()
    })

    it('deve propagar o erro do repositório quando a inserção violar a unicidade', async () => {
        // Arrange
        contratoRepoMock.buscarPorId.mockResolvedValue(contratoConcluido())
        const erroDuplicidade = Object.assign(new Error('E11000 duplicate key error'), { code: 11000 })
        avaliacaoRepoMock.inserir.mockRejectedValue(erroDuplicidade)

        // Act & Assert
        await expect(useCase.execute({ idContrato, nota: 5 }, idCliente)).rejects.toBe(erroDuplicidade)
    })

    it('deve lançar FormatoInvalidoError se anonima não for booleano', async () => {
        // Arrange
        contratoRepoMock.buscarPorId.mockResolvedValue(contratoConcluido())

        // Act & Assert
        await expect(useCase.execute({ idContrato, nota: 5, anonima: 'true' as any }, idCliente))
            .rejects.toThrow(FormatoInvalidoError)
    })

    it('deve cadastrar com anonima false quando não informada', async () => {
        // Arrange
        contratoRepoMock.buscarPorId.mockResolvedValue(contratoConcluido())

        // Act
        await useCase.execute({ idContrato, nota: 5 }, idCliente)

        // Assert
        expect(avaliacaoRepoMock.inserir.mock.calls[0][0].anonima).toBe(false)
    })
})
