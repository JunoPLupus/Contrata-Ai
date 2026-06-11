import { ValueObjectBase } from "../../value-object.base";

/**
 * Value Object genérico para campos `string`.
 * Centraliza a validação de campos textuais que não possuem regras
 * específicas além de obrigatoriedade e limites de tamanho, evitando a
 * criação de uma classe dedicada para cada campo (ex: `idCliente`,
 * `idPrestador`, `descricao`).
 *
 * Campos com regras de validação próprias (ex: `EmailUsuarioValueObject`,
 * que valida formato de e-mail) devem continuar com uma classe dedicada.
 */
export class StringValueObject extends ValueObjectBase {
    readonly valor: string

    /**
     * @param campo - Nome do campo, usado nas mensagens de erro de domínio.
     * @param valor - Aceita `any` para capturar inputs inválidos de runtime
     * (ex: campos ausentes no body HTTP) e lançar erros de domínio
     * em vez de `TypeError`.
     * @param limiteMinimo - Quantidade mínima de caracteres aceita (opcional).
     * @param limiteMaximo - Quantidade máxima de caracteres aceita (opcional).
     * @throws {CampoObrigatorioVazioError} Se o valor for nulo, undefined ou vazio.
     * @throws {FormatoInvalidoError} Se o valor não for uma `string`.
     * @throws {ValorLimiteError} Se o valor estiver fora dos limites informados.
     */
    constructor(campo: string, valor: any, limiteMinimo?: number, limiteMaximo?: number) {
        super(campo, limiteMinimo, limiteMaximo)

        this.validarString(valor)

        this.valor = valor
    }
}
