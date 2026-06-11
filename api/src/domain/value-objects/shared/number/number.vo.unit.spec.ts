import { NumberValueObject } from "./number.vo";

describe('NumberValueObject', () => {

    it('deve criar valor válido', () => {
        // Arrange
        const valorValido: number = 100
        let valorCriado: NumberValueObject
        // Act
        valorCriado = new NumberValueObject('precoMin', valorValido, 1)
        // Assert
        expect(valorCriado).toBeInstanceOf(NumberValueObject)
        expect(valorCriado.valor).toBe(valorValido)
    })

    it('deve criar valor válido sem limites', () => {
        // Arrange
        const valorValido: number = 0
        // Act
        const valorCriado = new NumberValueObject('prazoMedio', valorValido)
        // Assert
        expect(valorCriado.valor).toBe(valorValido)
    })

    it.each([
        ['undefined', undefined],
        ['string', '100']
    ])('deve lançar erro quando valor for %s', (_, valorInvalido) => {
        expect(() => new NumberValueObject('precoMin', valorInvalido, 1))
            .toThrow(
                expect.objectContaining({ message: "O 'precoMin' inserido é inválido. Verifique o formato e tente novamente." })
            )
    })

    it('deve lançar erro quando valor for menor que o limite mínimo', () => {
        // Arrange
        const valorAbaixo: number = 0
        // Act & Assert
        expect(() => new NumberValueObject('precoMin', valorAbaixo, 1)).toThrow(
            expect.objectContaining({ message: "O campo 'precoMin' deve ser no mínimo 1." })
        )
    })

    it('deve lançar erro quando valor for maior que o limite máximo', () => {
        // Arrange
        const valorAcima: number = 1000
        // Act & Assert
        expect(() => new NumberValueObject('precoMax', valorAcima, 1, 999)).toThrow(
            expect.objectContaining({ message: "O campo 'precoMax' deve ser no máximo 999." })
        )
    })
})
