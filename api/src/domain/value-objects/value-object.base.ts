import { isAbaixoLimite, isAcimaLimite, isString, isStringVazia } from "../utils/value-objects.utils";
import { CampoObrigatorioVazioError } from "../errors/campo-obrigatorio-vazio.error";
import { FormatoInvalidoError } from "../errors/formato-invalido.error";
import { ValorLimiteError } from "../errors/valor-limite.error";

export abstract class ValueObjectBase {
    protected readonly _campo: string
    protected readonly _limiteMinimo : number
    protected readonly _limiteMaximo : number

    protected constructor(campo: string, limiteMinimo?: number, limiteMaximo?: number) {
        this._campo = campo
        this._limiteMinimo = limiteMinimo ?? 0
        this._limiteMaximo = limiteMaximo ?? 0
    }

    protected validarString(value : any) : void {
        if (isStringVazia(value)) throw new CampoObrigatorioVazioError(this._campo)
        else if (!isString(value)) throw new FormatoInvalidoError(this._campo)
        else if (this._limiteMinimo > 0 && isAbaixoLimite(value, this._limiteMinimo)) throw new ValorLimiteError(this._campo, this._limiteMinimo, 'mínimo')
        else if (this._limiteMaximo > 0 && isAcimaLimite(value, this._limiteMaximo)) throw new ValorLimiteError(this._campo, this._limiteMaximo, 'máximo')
    }
}