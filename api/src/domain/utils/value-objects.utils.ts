export function isUndefined(value : any) : boolean {
    return value == undefined
}

export function isNumber(value: number | undefined) : boolean {
    return typeof value === 'number'
}

export function isString(value: string | undefined) : boolean {
    return typeof value === 'string'
}

export function isStringVazia(value: string | undefined) : boolean {
    return isUndefined(value) || (isString(value) && value!.trim().length === 0)
}

export function isArrayVazio(arrayString : string[] | undefined) : boolean {
    if (arrayString == null || arrayString.length === 0) return true

    return Array.isArray(arrayString) && arrayString.some( perfil => perfil.trim().length === 0 )
}

export function isNumberAbaixoLimite(value : number, limiteMinimo : number) : boolean {
    return value < limiteMinimo
}

export function isNumberAcimaLimite(value : number, limiteMaximo : number) : boolean {
    return value > limiteMaximo
}

export function isStringAbaixoLimite(nome : string, limiteMinimo : number) : boolean {
    return isNumberAbaixoLimite(nome.trim().length, limiteMinimo)
}

export function isStringAcimaLimite(nome : string, limiteMaximo : number) : boolean {
    return isNumberAcimaLimite(nome.trim().length, limiteMaximo)
}