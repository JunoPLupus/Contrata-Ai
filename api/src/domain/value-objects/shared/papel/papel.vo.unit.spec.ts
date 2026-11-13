import { PapelValueObject, Papel } from "./papel.vo";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";

describe('PapelValueObject', () => {
    describe('valores válidos', () => {
        it('deve aceitar "cliente"', () => {
            const vo = new PapelValueObject('autor', Papel.CLIENTE)
            expect(vo.valor).toBe('cliente')
        })

        it('deve aceitar "prestador"', () => {
            const vo = new PapelValueObject('autor', Papel.PRESTADOR)
            expect(vo.valor).toBe('prestador')
        })
    })

    describe('valores inválidos', () => {
        it.each([
            ['valor desconhecido', 'admin'],
            ['string vazia', ''],
            ['maiúsculas', 'CLIENTE'],
            ['undefined', undefined],
            ['null', null],
            ['número', 1],
        ])('deve lançar FormatoInvalidoError para %s', (_, valorInvalido) => {
            expect(() => new PapelValueObject('autor', valorInvalido)).toThrow(FormatoInvalidoError)
        })

        it('deve usar o nome do campo recebido na mensagem de erro', () => {
            expect(() => new PapelValueObject('autor', 'admin'))
                .toThrow("O 'autor' inserido é inválido. Verifique o formato e tente novamente.")
        })
    })
})
