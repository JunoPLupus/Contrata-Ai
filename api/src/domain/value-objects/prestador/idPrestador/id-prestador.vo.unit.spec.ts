import { IdPrestadorValueObject } from "./id-prestador.vo";
import { Types } from "mongoose";

describe('Id Prestador Value Object', () => {

    it('deve criar idPrestador valido', () => {
        // Arrange
        const idValido = new Types.ObjectId().toString()
        // Act
        const idCriado = new IdPrestadorValueObject(idValido)
        // Assert
        expect(idCriado).toBeInstanceOf(IdPrestadorValueObject)
        expect(idCriado.idPrestador).toBe(idValido)
    })

    it.each([
        ['undefined', undefined],
        ['vazio', ''],
        ['so espacos', '   ']
    ])('deve lancar erro quando idPrestador for %s', (_, idPrestador) => {
        expect(() => new IdPrestadorValueObject(idPrestador))
            .toThrow(
                expect.objectContaining({ message: "O campo 'idPrestador' é obrigatório." })
            )
    })

    it('deve lancar erro quando idPrestador nao for string', () => {
        const idInvalido = 34
        expect(() => new IdPrestadorValueObject(idInvalido))
            .toThrow(
                expect.objectContaining({ message: "O 'idPrestador' inserido é inválido. Verifique o formato e tente novamente." })
            )
    })
})
