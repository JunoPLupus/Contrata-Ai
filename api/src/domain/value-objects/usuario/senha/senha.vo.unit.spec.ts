import { SenhaUsuarioValueObject } from "./senha.vo";

describe('SenhaUsuarioValueObject', () => {

    it.each([
        ['sem espaços', 'senhaValida#123'],
        ['com espaços', '  senhaValida#123  '],
    ])('deve criar senha válida %s', (_, senhaValida) => {
        // Arrange
        let senhaCriada : SenhaUsuarioValueObject
        // Act
        senhaCriada = new SenhaUsuarioValueObject(senhaValida)
        // Assert
        expect(senhaCriada).toBeInstanceOf(SenhaUsuarioValueObject)
        expect(senhaCriada.senha).toBe(senhaValida)
    })

    it.each([
        ['undefined', undefined],
        ['vazia', ''],
        ['só espaços', '   ']
    ])('deve lançar erro quando senha for %s', (_, senhaInvalida) => {
        expect(() => new SenhaUsuarioValueObject(senhaInvalida))
            .toThrow(
                expect.objectContaining({ message: "O campo 'senha' é obrigatório." })
            )
    })

    it('deve lançar erro quando a senha não for string', () => {
        const senhaInvalida = 24
        expect(() => new SenhaUsuarioValueObject(senhaInvalida))
            .toThrow(
                expect.objectContaining({ message: "O 'senha' inserido é inválido. Verifique o formato e tente novamente." })
            )
    })

    it('deve lançar erro se a senha tiver menos de 6 caracteres', async () => {
        // Arrange
        const senhaCurta : string = "AA"
        // Act & Assert
        expect(()=> new SenhaUsuarioValueObject(senhaCurta)).toThrow(
            expect.objectContaining({ message : "O campo 'senha' deve conter no mínimo 6 caracteres." })
        )
    })

    it('deve lançar erro se a senha tiver mais de 64 caracteres', async () => {
        // Arrange
        const senhaLonga : string = "A".repeat(65)
        // Act & Assert
        expect(()=> new SenhaUsuarioValueObject(senhaLonga)).toThrow(
            expect.objectContaining({ message : "O campo 'senha' deve conter no máximo 64 caracteres." })
        )
    })
})