import { EmailUsuarioValueObject } from "./email.vo";

describe('EmailUsuarioValueObject', () => {

    it('deve criar um e-mail válido', async () => {
        // Arrange
        const emailValido : string = "fulano@gmail.com"
        let emailCriado: EmailUsuarioValueObject
        // Act
        emailCriado = new EmailUsuarioValueObject(emailValido)
        // Assert
        expect(emailCriado).toBeInstanceOf(EmailUsuarioValueObject)
        expect(emailCriado.email).toBe(emailValido)
    })

    it.each([
        ['vazio', ''],
        ['só espaços', '   ']
    ])('deve lançar erro quando o e-mail for %s', async (_, emailInvalido) => {
        expect(() => new EmailUsuarioValueObject(emailInvalido))
            .toThrow(
                expect.objectContaining({ message: "O campo 'email' é obrigatório." })
            )
    })

    it.each([
        [' email inválido'],
        ['exemplo@invalido']
    ])('deve lançar erro quando e-mail for inválido', async (emailInvalido) => {
        expect(() => new EmailUsuarioValueObject(emailInvalido))
            .toThrow(
                expect.objectContaining({ message: "O 'email' inserido é inválido. Verifique o formato e tente novamente." })
            )
    })
})