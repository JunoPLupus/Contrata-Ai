import { Types } from "mongoose";
import { CriarContratoUseCase } from "./criar-contrato.use-case";
import { ContratоMother } from "../../../../test-helpers/contrato.mother";
import { StatusContrato } from "../../../value-objects/contrato/status/status.vo";

describe('CriarContratoUseCase', () => {
    let useCase: CriarContratoUseCase
    let contratoRepoMock: ReturnType<typeof ContratоMother.criarRepositoryMock>

    const dadosValidos = () => ({
        idSolicitacao: new Types.ObjectId().toString(),
        idOrcamento: new Types.ObjectId().toString(),
        idCliente: new Types.ObjectId().toString(),
        idPrestador: new Types.ObjectId().toString(),
        dataAceite: new Date(),
        prazoEstimado: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    })

    beforeEach(() => {
        contratoRepoMock = ContratоMother.criarRepositoryMock()
        useCase = new CriarContratoUseCase(contratoRepoMock)
    })

    it('deve criar contrato com status aguardando_inicio e flags true', async () => {
        // Arrange
        const dados = dadosValidos()
        const contratoEsperado = ContratоMother.criarValido({
            ...dados,
            cienciaPagamento: true,
            whatsappLiberado: true,
        })
        contratoRepoMock.inserir.mockResolvedValue(contratoEsperado)

        // Act
        const resultado = await useCase.execute(dados)

        // Assert
        expect(contratoRepoMock.inserir).toHaveBeenCalledTimes(1)
        expect(resultado.status).toBe(StatusContrato.AGUARDANDO_INICIO)
        expect(resultado.cienciaPagamento).toBe(true)
        expect(resultado.whatsappLiberado).toBe(true)
    })

    it('deve repassar os ids corretos ao repositório', async () => {
        // Arrange
        const dados = dadosValidos()
        const contratoEsperado = ContratоMother.criarValido(dados)
        contratoRepoMock.inserir.mockResolvedValue(contratoEsperado)

        // Act
        await useCase.execute(dados)

        // Assert
        const contratoPassado = contratoRepoMock.inserir.mock.calls[0][0]
        expect(contratoPassado.idSolicitacao).toBe(dados.idSolicitacao)
        expect(contratoPassado.idOrcamento).toBe(dados.idOrcamento)
        expect(contratoPassado.idCliente).toBe(dados.idCliente)
        expect(contratoPassado.idPrestador).toBe(dados.idPrestador)
    })
})
