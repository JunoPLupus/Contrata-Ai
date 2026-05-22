import { PrazoMedioValueObject } from "./prazo-medio.vo";

describe('Prazo Medio Value Object', () => {

    it('deve criar prazoMedio valido', () => {
        // Arrange
        const prazoValido = 7
        // Act
        const prazoCriado = new PrazoMedioValueObject(prazoValido)
        // Assert
        expect(prazoCriado).toBeInstanceOf(PrazoMedioValueObject)
        expect(prazoCriado.prazoMedio).toBe(prazoValido)
    })

    it.each([
        ['undefined', undefined],
        ['string', 'sete'],
        ['null', null]
    ])('deve lancar erro quando prazoMedio for %s', (_, prazoInvalido) => {
        expect(() => new PrazoMedioValueObject(prazoInvalido))
            .toThrow(
                expect.objectContaining({ message: "O 'prazoMedio' inserido é inválido. Verifique o formato e tente novamente." })
            )
    })

    it('deve lancar erro quando prazoMedio for menor que 1', () => {
        const prazoInvalido = 0
        expect(() => new PrazoMedioValueObject(prazoInvalido)).toThrow(
            expect.objectContaining({ message: "O campo 'prazoMedio' deve ser no mínimo 1." })
        )
    })
})
