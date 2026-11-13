import { ValueObjectBase } from "../../value-object.base";
import { FormatoInvalidoError } from "../../../errors/formato-invalido.error";

/**
 * Papéis que um perfil pode exercer na plataforma. Admin/suporte não é papel desta API.
 */
export const Papel = {
    CLIENTE: 'cliente',
    PRESTADOR: 'prestador',
} as const

export type PapelTipo = typeof Papel[keyof typeof Papel]

const valoresValidos = Object.values(Papel)

/**
 * Value Object compartilhado para campos que guardam um papel (`'cliente'` | `'prestador'`),
 * como o `autor` da avaliação. Recebe o nome do campo no construtor (como o
 * `StringValueObject`), pois o mesmo conjunto de valores pode aparecer em campos diferentes.
 *
 * @throws {FormatoInvalidoError} Se o valor não pertencer ao conjunto permitido.
 */
export class PapelValueObject extends ValueObjectBase {
    readonly valor: PapelTipo

    /**
     * @param campo - Nome do campo, usado nas mensagens de erro de domínio.
     * @param valor - Aceita `any` para capturar inputs inválidos de runtime e lançar
     *   erros de domínio em vez de `TypeError`.
     * @throws {FormatoInvalidoError} Se o valor não for um papel válido.
     */
    constructor(campo: string, valor: any) {
        super(campo)

        if (!valoresValidos.includes(valor)) {
            throw new FormatoInvalidoError(campo)
        }

        this.valor = valor
    }
}
