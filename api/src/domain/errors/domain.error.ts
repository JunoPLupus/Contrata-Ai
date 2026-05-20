export abstract class DomainError extends Error {
    abstract readonly statusCode: number

    protected constructor(name : string, message: string) {
        super(message)
        this.name = name;
        Object.setPrototypeOf(this, new.target.prototype)
    }
}
