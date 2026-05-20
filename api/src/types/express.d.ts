declare namespace Express {
    interface Request {
        user?: import("../http/types/token-payload.interface").TokenPayload
    }
}