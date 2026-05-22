import { NomeValueObject } from "./nome.vo";

describe('NomeUsuarioValueObject', () => {

    it('deve criar nome válido', async () => {
        // Arrange
        const nomeValido : string = "Fulano da Silva"
        let nomeCriado : NomeValueObject
        // Act
        nomeCriado = new NomeValueObject(nomeValido)
        // Assert
        expect(nomeCriado).toBeInstanceOf(NomeValueObject)
        expect(nomeCriado.nome).toBe(nomeValido)
    })

    it.each([
        ['undefined', undefined],
        ['vazio', ''],
        ['só espaços', '   ']
    ])('deve lançar erro quando nome for %s', (_, nomeInvalido) => {
        expect(() => new NomeValueObject(nomeInvalido))
            .toThrow(
                expect.objectContaining({ message: "O campo 'nome' é obrigatório." })
        )
    })

    it('deve lançar erro quando nome não for string', () => {
        const nomeInvalido = 34
        expect(() => new NomeValueObject(nomeInvalido))
            .toThrow(
                expect.objectContaining({ message: "O 'nome' inserido é inválido. Verifique o formato e tente novamente." })
            )
    })

    it('deve lançar erro quando nome tiver menos de 3 caracteres', async () => {
        // Arrange
        const nomeCurto : string = "AA"
        // Act & Assert
        expect(() => new NomeValueObject(nomeCurto)).toThrow(
            expect.objectContaining({ message: "O campo 'nome' deve conter no mínimo 3 caracteres." })
        )
    })

    it('deve lançar erro quando nome tiver mais de 150 caracteres', async () => {
        // Arrange
        const nomeLongo : string = "A".repeat(151)
        // Act & Assert
        expect(() => new NomeValueObject(nomeLongo)).toThrow(
            expect.objectContaining({ message: "O campo 'nome' deve conter no máximo 150 caracteres." })
        )
    })
})