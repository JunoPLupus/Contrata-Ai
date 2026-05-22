import { PrecoMaxValueObject } from "./preco-max.vo";

describe('Preco Maximo Value Object', () => {

    it('deve criar precoMax valido', () => {
        // Arrange
        const precoValido = 500
        // Act
        const precoCriado = new PrecoMaxValueObject(precoValido)
        // Assert
        expect(precoCriado).toBeInstanceOf(PrecoMaxValueObject)
        expect(precoCriado.precoMax).toBe(precoValido)
    })

    it.each([
        ['undefined', undefined],
        ['string', 'quinhentos'],
        ['null', null]
    ])('deve lancar erro quando precoMax for %s', (_, precoInvalido) => {
        expect(() => new PrecoMaxValueObject(precoInvalido))
            .toThrow(
                expect.objectContaining({ message: "O 'precoMax' inserido é inválido. Verifique o formato e tente novamente." })
            )
    })

    it('deve lancar erro quando precoMax for menor que 1', () => {
        const precoInvalido = 0
        expect(() => new PrecoMaxValueObject(precoInvalido)).toThrow(
            expect.objectContaining({ message: "O campo 'precoMax' deve ser no mínimo 1." })
        )
    })
})
