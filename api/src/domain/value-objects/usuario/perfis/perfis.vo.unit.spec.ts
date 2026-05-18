import { PerfisUsuarioValueObject } from "./perfis.vo";

describe('Perfis de Usuário Value Object', () => {

    it.each([
        ['cliente', ['cliente']],
        ['cliente e prestador', ['cliente', 'prestador']],
    ])('deve criar perfis válido com %s', (_, perfisValido) => {
        // Arrange
        let perfisCriado : PerfisUsuarioValueObject
        // Act
        perfisCriado = new PerfisUsuarioValueObject(perfisValido)
        // Assert
        expect(perfisCriado).not.toBeNull()
        expect(perfisCriado).toBeInstanceOf(PerfisUsuarioValueObject)
        expect(perfisCriado.perfis).toEqual(perfisValido)
    })

    it.each([
        ['undefined', undefined],
        ['vazio', ['']],
        ['vazio com espaços', ['    ']]
    ])('deve lançar erro quando perfis for %s', (_, perfisVazio) => {
        expect(() => new PerfisUsuarioValueObject(perfisVazio))
            .toThrow(
                expect.objectContaining({ message: "O campo 'perfis' é obrigatório." })
            )
    })

    it.each([
        ['diferente de array de string', 'cliente'],
        ['duplicado', ['cliente', 'cliente']],
        ['tipo não existente', ['cliente','admin']],
        ['apenas prestador', ['prestador']]
    ])('deve lançar erro quando perfis for %s', (_, perfisInvalido) => {
        expect(() => new PerfisUsuarioValueObject(perfisInvalido))
            .toThrow(
                expect.objectContaining({ message: "O 'perfis' inserido é inválido. Verifique o formato e tente novamente." })
            )
    })
})