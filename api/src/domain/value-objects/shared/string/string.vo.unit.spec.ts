import { StringValueObject } from "./string.vo";

describe('StringValueObject', () => {

    it('deve criar valor válido', () => {
        // Arrange
        const valorValido: string = "Fulano da Silva"
        let valorCriado: StringValueObject
        // Act
        valorCriado = new StringValueObject('nome', valorValido, 3, 150)
        // Assert
        expect(valorCriado).toBeInstanceOf(StringValueObject)
        expect(valorCriado.valor).toBe(valorValido)
    })

    it('deve criar valor válido sem limites de tamanho', () => {
        // Arrange
        const valorValido: string = "abc123"
        // Act
        const valorCriado = new StringValueObject('idCliente', valorValido)
        // Assert
        expect(valorCriado.valor).toBe(valorValido)
    })

    it.each([
        ['undefined', undefined],
        ['vazio', ''],
        ['só espaços', '   ']
    ])('deve lançar erro quando valor for %s', (_, valorInvalido) => {
        expect(() => new StringValueObject('nome', valorInvalido))
            .toThrow(
                expect.objectContaining({ message: "O campo 'nome' é obrigatório." })
            )
    })

    it('deve lançar erro quando valor não for string', () => {
        const valorInvalido = 34
        expect(() => new StringValueObject('nome', valorInvalido))
            .toThrow(
                expect.objectContaining({ message: "O 'nome' inserido é inválido. Verifique o formato e tente novamente." })
            )
    })

    it('deve lançar erro quando valor tiver menos caracteres que o limite mínimo', () => {
        // Arrange
        const valorCurto: string = "AA"
        // Act & Assert
        expect(() => new StringValueObject('nome', valorCurto, 3, 150)).toThrow(
            expect.objectContaining({ message: "O campo 'nome' deve conter no mínimo 3 caracteres." })
        )
    })

    it('deve lançar erro quando valor tiver mais caracteres que o limite máximo', () => {
        // Arrange
        const valorLongo: string = "A".repeat(151)
        // Act & Assert
        expect(() => new StringValueObject('nome', valorLongo, 3, 150)).toThrow(
            expect.objectContaining({ message: "O campo 'nome' deve conter no máximo 150 caracteres." })
        )
    })
})
