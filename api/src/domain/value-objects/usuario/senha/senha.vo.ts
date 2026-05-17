import { ValueObjectBase } from "../../value-object.base";

/**
 * Senha do usuário - `string`.
 * Mínimo: 6 caracteres. Máximo: 64 caracteres.
 */
export class SenhaUsuarioValueObject extends ValueObjectBase {
    readonly senha: string

    /**
     * @param senha - Aceita `any` para capturar inputs inválidos de runtime
     * (ex: campos ausentes no body HTTP) e lançar erros de domínio
     * em vez de `TypeError`.
     * @throws {CampoObrigatorioVazioError} Se a senha for nula, undefined ou vazia.
     * @throws {FormatoInvalidoError} Se a senha não for uma `string`.
     * @throws {ValorLimiteError} Se a senha tiver menos de 6 ou mais de 64 caracteres.
     */
    constructor(senha: any) {
        super('senha', 6, 64)

        this.validarString(senha)

        this.senha = senha
    }
}