import { IdClienteValueObject } from "./id-cliente.vo";
import { Types } from "mongoose";

describe('IDClienteValueObject', () => {

    it('deve criar idCliente válido', () => {
        // Arrange
        const idValido = new Types.ObjectId().toString()
        // Act
        const idCriado = new IdClienteValueObject(idValido)
        // Assert
        expect(idCriado).toBeInstanceOf(IdClienteValueObject)
        expect(idCriado.idCliente).toBe(idValido)
    })

    it.each([
        ['undefined', undefined],
        ['vazio', ''],
        ['só espaços', '   ']
    ])('deve lançar erro quando idCliente for %s', (_, idCliente) => {
        expect(() => new IdClienteValueObject(idCliente))
            .toThrow(
                expect.objectContaining({ message: "O campo 'idCliente' é obrigatório." })
            )
    })

    it('deve lançar erro quando idCliente não for string', () => {
        const idInvalido = 34
        expect(() => new IdClienteValueObject(idInvalido))
            .toThrow(
                expect.objectContaining({ message: "O 'idCliente' inserido é inválido. Verifique o formato e tente novamente." })
            )
    })
})