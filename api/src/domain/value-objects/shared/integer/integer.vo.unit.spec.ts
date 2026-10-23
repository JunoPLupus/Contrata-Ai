import { IntegerValueObject } from "./integer.vo";

describe('IntegerValueObject', () => {

    it('deve criar valor inteiro válido', () => {
        // Arrange
        const valorValido: number = 72
        // Act
        const valorCriado = new IntegerValueObject('prazoMedioHoras', valorValido, 1)
        // Assert
        expect(valorCriado).toBeInstanceOf(IntegerValueObject)
        expect(valorCriado.valor).toBe(valorValido)
    })

    it.each([
        ['fracionado', 1.5],
        ['string', '72'],
        ['undefined', undefined]
    ])('deve lançar erro quando valor for %s', (_, valorInvalido) => {
        expect(() => new IntegerValueObject('prazoMedioHoras', valorInvalido, 1))
            .toThrow(
                expect.objectContaining({ message: "O 'prazoMedioHoras' inserido é inválido. Verifique o formato e tente novamente." })
            )
    })

    it('deve lançar erro quando valor for menor que o limite mínimo', () => {
        // Act & Assert
        expect(() => new IntegerValueObject('prazoMedioHoras', 0, 1)).toThrow(
            expect.objectContaining({ message: "O campo 'prazoMedioHoras' deve ser no mínimo 1." })
        )
    })
})
