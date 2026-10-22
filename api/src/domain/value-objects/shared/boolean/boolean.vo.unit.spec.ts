import { BooleanValueObject } from "./boolean.vo";

describe('BooleanValueObject', () => {

    it.each([true, false])('deve criar valor válido %s', (valorValido) => {
        // Act
        const valorCriado = new BooleanValueObject('atendimentoDomiciliar', valorValido)
        // Assert
        expect(valorCriado).toBeInstanceOf(BooleanValueObject)
        expect(valorCriado.valor).toBe(valorValido)
    })

    it.each([
        ['string', 'true'],
        ['number', 1],
        ['undefined', undefined],
        ['null', null]
    ])('deve lançar erro quando valor for %s', (_, valorInvalido) => {
        expect(() => new BooleanValueObject('atendimentoDomiciliar', valorInvalido))
            .toThrow(
                expect.objectContaining({ message: "O 'atendimentoDomiciliar' inserido é inválido. Verifique o formato e tente novamente." })
            )
    })
})
