import { Types } from "mongoose";
import { BuscarContratoPorIdUseCase } from "./buscar-contrato-por-id.use-case";
import { ContratоMother } from "../../../../test-helpers/contrato.mother";
import { PrestadorMother } from "../../../../test-helpers/prestador.mother";
import { UsuarioMother } from "../../../../test-helpers/usuario.mother";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

describe('BuscarContratoPorIdUseCase', () => {
    let useCase: BuscarContratoPorIdUseCase
    let contratoRepoMock: ReturnType<typeof ContratоMother.criarRepositoryMock>
    let prestadorRepoMock: jest.Mocked<{ buscarPorId: jest.Mock }>
    let usuarioRepoMock: jest.Mocked<{ buscarPorId: jest.Mock }>

    const idCliente = new Types.ObjectId().toString()
    const idPrestador = new Types.ObjectId().toString()

    beforeEach(() => {
        contratoRepoMock = ContratоMother.criarRepositoryMock()
        prestadorRepoMock = { buscarPorId: jest.fn() } as any
        usuarioRepoMock = { buscarPorId: jest.fn() } as any
        useCase = new BuscarContratoPorIdUseCase(contratoRepoMock as any, prestadorRepoMock as any, usuarioRepoMock as any)
    })

    it('deve retornar o contrato para o cliente vinculado', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente, whatsappLiberado: false })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act
        const resultado = await useCase.execute(contrato.id!, idCliente)

        // Assert
        expect(resultado.id).toBe(contrato.id)
        expect(prestadorRepoMock.buscarPorId).not.toHaveBeenCalled()
    })

    it('deve retornar o contrato para o prestador vinculado', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idPrestador, whatsappLiberado: false })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act
        const resultado = await useCase.execute(contrato.id!, new Types.ObjectId().toString(), idPrestador)

        // Assert
        expect(resultado.id).toBe(contrato.id)
    })

    it('deve incluir whatsappPrestador quando whatsappLiberado é true', async () => {
        // Arrange
        const idDonoPresador = new Types.ObjectId().toString()
        const contrato = ContratоMother.criarValido({ idCliente, idPrestador, whatsappLiberado: true })
        const prestador = PrestadorMother.criarValido({ id: idPrestador, idCliente: idDonoPresador })
        const usuario = UsuarioMother.criarUsuarioValido({ id: idDonoPresador, whatsapp: '11999999999' })

        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)
        prestadorRepoMock.buscarPorId.mockResolvedValue(prestador)
        usuarioRepoMock.buscarPorId.mockResolvedValue(usuario)

        // Act
        const resultado = await useCase.execute(contrato.id!, idCliente)

        // Assert
        expect((resultado as any).whatsappPrestador).toBe('11999999999')
    })

    it('não deve expor whatsapp quando whatsappLiberado é false', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente, whatsappLiberado: false })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act
        const resultado = await useCase.execute(contrato.id!, idCliente)

        // Assert
        expect((resultado as any).whatsappPrestador).toBeUndefined()
    })

    it('deve lançar RecursoNaoEncontradoError se contrato não existir', async () => {
        // Arrange
        contratoRepoMock.buscarPorId.mockResolvedValue(null)

        // Act & Assert
        await expect(useCase.execute('id-inexistente', idCliente))
            .rejects.toThrow(RecursoNaoEncontradoError)
    })

    it('deve lançar AcessoProibidoError se usuário não for parte', async () => {
        // Arrange
        const contrato = ContratоMother.criarValido({ idCliente: new Types.ObjectId().toString() })
        contratoRepoMock.buscarPorId.mockResolvedValue(contrato)

        // Act & Assert
        await expect(useCase.execute(contrato.id!, idCliente))
            .rejects.toThrow(AcessoProibidoError)
    })
})
