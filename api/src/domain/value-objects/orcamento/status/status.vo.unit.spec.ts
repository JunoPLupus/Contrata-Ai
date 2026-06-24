import { StatusOrcamentoValueObject, StatusOrcamento } from "./status.vo";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";

describe('StatusOrcamentoValueObject', () => {
    describe('valores válidos', () => {
        it('deve aceitar "pendente"', () => {
            const vo = new StatusOrcamentoValueObject(StatusOrcamento.PENDENTE)
            expect(vo.valor).toBe('pendente')
        })

        it('deve aceitar "aceito"', () => {
            const vo = new StatusOrcamentoValueObject(StatusOrcamento.ACEITO)
            expect(vo.valor).toBe('aceito')
        })

        it('deve aceitar "encerrado"', () => {
            const vo = new StatusOrcamentoValueObject(StatusOrcamento.ENCERRADO)
            expect(vo.valor).toBe('encerrado')
        })

        it('deve aceitar "cancelado"', () => {
            const vo = new StatusOrcamentoValueObject(StatusOrcamento.CANCELADO)
            expect(vo.valor).toBe('cancelado')
        })
    })

    describe('valores inválidos', () => {
        it('deve lançar FormatoInvalidoError para valor desconhecido', () => {
            expect(() => new StatusOrcamentoValueObject('aberta')).toThrow(FormatoInvalidoError)
        })

        it('deve lançar FormatoInvalidoError para string vazia', () => {
            expect(() => new StatusOrcamentoValueObject('')).toThrow(FormatoInvalidoError)
        })

        it('deve lançar FormatoInvalidoError para undefined', () => {
            expect(() => new StatusOrcamentoValueObject(undefined)).toThrow(FormatoInvalidoError)
        })

        it('deve lançar FormatoInvalidoError para null', () => {
            expect(() => new StatusOrcamentoValueObject(null)).toThrow(FormatoInvalidoError)
        })

        it('deve lançar FormatoInvalidoError para número', () => {
            expect(() => new StatusOrcamentoValueObject(1)).toThrow(FormatoInvalidoError)
        })
    })
})
