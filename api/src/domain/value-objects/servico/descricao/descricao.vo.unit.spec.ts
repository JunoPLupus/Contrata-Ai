import { DescricaoValueObject } from "./descricao.vo";

describe('Descricao Value Object', () => {

    it('deve criar descrição válida', () => {
        // Arrange
        const descricaoValida = "Serviço de instalação elétrica residencial"
        // Act
        const descricaoCriada = new DescricaoValueObject(descricaoValida)
        // Assert
        expect(descricaoCriada).toBeInstanceOf(DescricaoValueObject)
        expect(descricaoCriada.descricao).toBe(descricaoValida)
    })

    it.each([
        ['undefined', undefined],
        ['vazio', ''],
        ['só espacos', '   ']
    ])('deve lancar erro quando descrição for %s', (_, descricaoInvalida) => {
        expect(() => new DescricaoValueObject(descricaoInvalida))
            .toThrow(
                expect.objectContaining({ message: "O campo 'descricao' é obrigatório." })
            )
    })

    it('deve lancar erro quando descrição não for string', () => {
        const descricaoInvalida = 42
        expect(() => new DescricaoValueObject(descricaoInvalida))
            .toThrow(
                expect.objectContaining({ message: "O 'descricao' inserido é inválido. Verifique o formato e tente novamente." })
            )
    })

    it('deve lancar erro quando descrição tiver menos de 5 caracteres', () => {
        const descricaoCurta = "A"
        expect(() => new DescricaoValueObject(descricaoCurta)).toThrow(
            expect.objectContaining({ message: "O campo 'descricao' deve conter no mínimo 5 caracteres." })
        )
    })

    it('deve lancar erro quando descrição tiver mais de 500 caracteres', () => {
        const descricaoLonga = "A".repeat(501)
        expect(() => new DescricaoValueObject(descricaoLonga)).toThrow(
            expect.objectContaining({ message: "O campo 'descricao' deve conter no máximo 500 caracteres." })
        )
    })
})
