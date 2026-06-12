import { CepValueObject } from "./cep.vo";

describe('CepValueObject', () => {

    it('deve criar um CEP válido com traço', () => {
        // Arrange
        const cepValido : string = "01000-000"
        let cepCriado: CepValueObject
        // Act
        cepCriado = new CepValueObject(cepValido)
        // Assert
        expect(cepCriado).toBeInstanceOf(CepValueObject)
        expect(cepCriado.valor).toBe(cepValido)
    })

    it('deve criar um CEP válido sem traço', () => {
        // Arrange
        const cepValido : string = "01000000"
        // Act
        const cepCriado = new CepValueObject(cepValido)
        // Assert
        expect(cepCriado.valor).toBe(cepValido)
    })

    it.each([
        ['undefined', undefined],
        ['vazio', ''],
        ['só espaços', '   ']
    ])('deve lançar erro quando o CEP for %s', (_, cepInvalido) => {
        expect(() => new CepValueObject(cepInvalido))
            .toThrow(
                expect.objectContaining({ message: "O campo 'localizacaoCep' é obrigatório." })
            )
    })

    it.each([
        ['123'],
        ['123456789'],
        ['abcde-123']
    ])('deve lançar erro quando o CEP for inválido', (cepInvalido) => {
        expect(() => new CepValueObject(cepInvalido))
            .toThrow(
                expect.objectContaining({ message: "O 'localizacaoCep' inserido é inválido. Verifique o formato e tente novamente." })
            )
    })
})
