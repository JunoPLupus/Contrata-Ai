export function isString(value: string | undefined) : boolean {
    return typeof value === "string"
}

export function isStringVazia(value: string | undefined) : boolean {
    return value == undefined || (typeof value == "string" && value.trim().length === 0)
}

export function isArrayVazio(arrayString : string[] | undefined) : boolean {
    if (arrayString == null || arrayString.length === 0) return true

    return Array.isArray(arrayString) && arrayString.some( perfil => perfil.trim().length === 0 )
}

export function isAbaixoLimite(nome : string, limiteMinimo : number) : boolean {
    return nome.trim().length < limiteMinimo
}

export function isAcimaLimite(nome : string, limiteMaximo : number) : boolean {
    return nome.trim().length > limiteMaximo
}