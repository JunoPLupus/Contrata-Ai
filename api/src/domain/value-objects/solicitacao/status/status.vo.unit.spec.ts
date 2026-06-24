import { StatusSolicitacaoValueObject, StatusSolicitacao } from "./status.vo";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";

describe('StatusSolicitacaoValueObject', () => {
    describe('valores válidos', () => {
        it('deve aceitar "aberta"', () => {
            const vo = new StatusSolicitacaoValueObject(StatusSolicitacao.ABERTA)
            expect(vo.valor).toBe('aberta')
        })

        it('deve aceitar "encerrada"', () => {
            const vo = new StatusSolicitacaoValueObject(StatusSolicitacao.ENCERRADA)
            expect(vo.valor).toBe('encerrada')
        })

        it('deve aceitar "cancelada"', () => {
            const vo = new StatusSolicitacaoValueObject(StatusSolicitacao.CANCELADA)
            expect(vo.valor).toBe('cancelada')
        })
    })

    describe('valores inválidos', () => {
        it('deve lançar FormatoInvalidoError para valor desconhecido', () => {
            expect(() => new StatusSolicitacaoValueObject('pendente')).toThrow(FormatoInvalidoError)
        })

        it('deve lançar FormatoInvalidoError para string vazia', () => {
            expect(() => new StatusSolicitacaoValueObject('')).toThrow(FormatoInvalidoError)
        })

        it('deve lançar FormatoInvalidoError para undefined', () => {
            expect(() => new StatusSolicitacaoValueObject(undefined)).toThrow(FormatoInvalidoError)
        })

        it('deve lançar FormatoInvalidoError para null', () => {
            expect(() => new StatusSolicitacaoValueObject(null)).toThrow(FormatoInvalidoError)
        })

        it('deve lançar FormatoInvalidoError para número', () => {
            expect(() => new StatusSolicitacaoValueObject(1)).toThrow(FormatoInvalidoError)
        })
    })
})
