import { TelefoneUsuarioValueObject } from "./telefone.vo";

describe('TelefoneUsuarioValueObject', () => {

    it('deve criar um telefone válido sem formatação', () => {
        // Arrange
        const telefoneValido : string = "11999999999"
        let telefoneCriado: TelefoneUsuarioValueObject
        // Act
        telefoneCriado = new TelefoneUsuarioValueObject('telefone', telefoneValido)
        // Assert
        expect(telefoneCriado).toBeInstanceOf(TelefoneUsuarioValueObject)
        expect(telefoneCriado.valor).toBe(telefoneValido)
    })

    it('deve criar um telefone válido formatado', () => {
        // Arrange
        const telefoneValido : string = "(11) 99999-9999"
        // Act
        const telefoneCriado = new TelefoneUsuarioValueObject('whatsapp', telefoneValido)
        // Assert
        expect(telefoneCriado.valor).toBe(telefoneValido)
    })

    it.each([
        ['undefined', undefined],
        ['vazio', ''],
        ['só espaços', '   ']
    ])('deve lançar erro quando o telefone for %s', (_, telefoneInvalido) => {
        expect(() => new TelefoneUsuarioValueObject('telefone', telefoneInvalido))
            .toThrow(
                expect.objectContaining({ message: "O campo 'telefone' é obrigatório." })
            )
    })

    it.each([
        ['23'],
        ['123456789012345'],
        ['(00) 99999-9999']
    ])('deve lançar erro quando o telefone for inválido', (telefoneInvalido) => {
        expect(() => new TelefoneUsuarioValueObject('telefone', telefoneInvalido))
            .toThrow(
                expect.objectContaining({ message: "O 'telefone' inserido é inválido. Verifique o formato e tente novamente." })
            )
    })
})
