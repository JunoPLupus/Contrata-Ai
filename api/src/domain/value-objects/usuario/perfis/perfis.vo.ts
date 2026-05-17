import { CampoObrigatorioVazioError } from "../../../errors/campo-obrigatorio-vazio.error";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";
import { isArrayVazio } from "../../../utils/value-objects.utils";
import { ValueObjectBase } from "../../value-object.base";

export type PerfisValidos = 'cliente' | 'prestador'

/**
 * Perfis do usuário - converte `string[]` para `PerfisValidos[]`.
 * Todo usuário deve ter ao menos o perfil 'cliente'.
 * Valores permitidos: 'cliente', 'prestador'. Não permite duplicatas.
 */
export class PerfisUsuarioValueObject extends ValueObjectBase {
    readonly perfis: PerfisValidos[]

    /**
     * @param perfis - Aceita `any` para capturar inputs inválidos de runtime
     * (ex: campos ausentes no body HTTP) e lançar erros de domínio
     * em vez de `TypeError`.
     * @throws {CampoObrigatorioVazioError} Se perfis for nulo, undefined, array vazio ou contiver elementos vazios.
     * @throws {FormatoInvalidoError} Se perfis não for um array, contiver valores inválidos, duplicatas ou não incluir 'cliente'.
     */
    constructor(perfis : any) {
        super('perfis')
        if (isArrayVazio(perfis)) throw new CampoObrigatorioVazioError(this._campo)
        else if (this.isInvalido(perfis)) throw new FormatoInvalidoError(this._campo)

        this.perfis = perfis as Array< 'cliente' | 'prestador' >
    }

    private isInvalido(perfis: any): boolean {
        if (!Array.isArray(perfis)) return true

        if (perfis.length > 2) return true
        if (new Set(perfis).size !== perfis.length) return true

        if (!perfis.some(perfil => perfil == 'cliente')) return true

        const valoresPermitidos : PerfisValidos[] = ['cliente', 'prestador']
        return perfis.some( perfil => !valoresPermitidos.includes(perfil))
    }
}