import { PrecoMinValueObject } from "./preco-min.vo";

describe('Preco Minimo Value Object', () => {

    it('deve criar precoMin valido', () => {
        // Arrange
        const precoValido = 50
        // Act
        const precoCriado = new PrecoMinValueObject(precoValido)
        // Assert
        expect(precoCriado).toBeInstanceOf(PrecoMinValueObject)
        expect(precoCriado.precoMin).toBe(precoValido)
    })

    it.each([
        ['undefined', undefined],
        ['string', 'cinquenta'],
        ['null', null]
    ])('deve lancar erro quando precoMin for %s', (_, precoInvalido) => {
        expect(() => new PrecoMinValueObject(precoInvalido))
            .toThrow(
                expect.objectContaining({ message: "O 'precoMin' inserido é inválido. Verifique o formato e tente novamente." })
            )
    })

    it('deve lancar erro quando precoMin for menor que 1', () => {
        const precoInvalido = 0
        expect(() => new PrecoMinValueObject(precoInvalido)).toThrow(
            expect.objectContaining({ message: "O campo 'precoMin' deve ser no mínimo 1." })
        )
    })
})
