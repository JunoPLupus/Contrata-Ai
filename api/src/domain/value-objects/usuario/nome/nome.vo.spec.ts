import { NomeUsuarioValueObject } from "./nome.vo";

describe('NomeUsuarioValueObject', () => {

    it('deve criar nome válido', async () => {
        // Arrange
        const nomeValido : string = "Fulano da Silva"
        let nomeCriado : NomeUsuarioValueObject
        // Act
        nomeCriado = new NomeUsuarioValueObject(nomeValido)
        // Assert
        expect(nomeCriado).toBeInstanceOf(NomeUsuarioValueObject)
        expect(nomeCriado.nome).toBe(nomeValido)
    })

    it.each([
        ['vazio', ''],
        ['só espaços', '   ']
    ])('deve lançar erro quando nome for %s', (_, nomeInvalido) => {
        expect(() => new NomeUsuarioValueObject(nomeInvalido))
            .toThrow(
                expect.objectContaining({ message: "O campo 'nome' é obrigatório." })
        )
    })

    it('deve lançar erro quando nome tiver menos de 3 caracteres', async () => {
        // Arrange
        const nomeCurto : string = "AA"
        // Act & Assert
        expect(() => new NomeUsuarioValueObject(nomeCurto)).toThrow(
            expect.objectContaining({ message: "O campo 'nome' deve conter no mínimo 3 caracteres." })
        )
    })

    it('deve lançar erro quando nome tiver mais de 150 caracteres', async () => {
        // Arrange
        const nomeLongo : string = "A".repeat(151)
        // Act & Assert
        expect(() => new NomeUsuarioValueObject(nomeLongo)).toThrow(
            expect.objectContaining({ message: "O campo 'nome' deve conter no máximo 150 caracteres." })
        )
    })
})