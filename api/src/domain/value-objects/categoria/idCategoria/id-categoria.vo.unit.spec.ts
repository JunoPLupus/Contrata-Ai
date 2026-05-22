import { IdCategoriaValueObject } from "./id-categoria.vo";
import { Types } from "mongoose";

describe('IdCategoria Value Object', () => {

    it('deve criar idCategoria valido', () => {
        // Arrange
        const idValido = new Types.ObjectId().toString()
        // Act
        const idCriado = new IdCategoriaValueObject(idValido)
        // Assert
        expect(idCriado).toBeInstanceOf(IdCategoriaValueObject)
        expect(idCriado.idCategoria).toBe(idValido)
    })

    it.each([
        ['undefined', undefined],
        ['vazio', ''],
        ['so espacos', '   ']
    ])('deve lancar erro quando idCategoria for %s', (_, idCategoria) => {
        expect(() => new IdCategoriaValueObject(idCategoria))
            .toThrow(
                expect.objectContaining({ message: "O campo 'idCategoria' é obrigatório." })
            )
    })

    it('deve lancar erro quando idCategoria nao for string', () => {
        const idInvalido = 34
        expect(() => new IdCategoriaValueObject(idInvalido))
            .toThrow(
                expect.objectContaining({ message: "O 'idCategoria' inserido é inválido. Verifique o formato e tente novamente." })
            )
    })
})
