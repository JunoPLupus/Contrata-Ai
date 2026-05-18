import { ValueObjectBase } from "../../value-object.base";

/**
 * Nome do usuário - `string`.
 * Valor é armazenado sem espaços nas extremidades (trim aplicado na construção).
 * Mínimo: 3 caracteres. Máximo: 150 caracteres.
 */
export class NomeUsuarioValueObject extends ValueObjectBase {
    readonly nome: string

    /**
     * @param nome - Aceita `any` para capturar inputs inválidos de runtime
     * (ex: campos ausentes no body HTTP) e lançar erros de domínio
     * em vez de `TypeError`.
     * @throws {CampoObrigatorioVazioError} Se o nome for nulo, undefined ou vazio.
     * @throws {FormatoInvalidoError} Se o nome não for uma `string`.
     * @throws {ValorLimiteError} Se o nome tiver menos de 3 ou mais de 150 caracteres.
     */
    constructor(nome: any) {
        super('nome', 3, 150);

        this.validarString(nome)

        this.nome = nome
    }
}