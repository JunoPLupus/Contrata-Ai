export const config = {
    bcryptSaltRounds: Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
    jwtSecret: process.env.JWT_SECRET || 'secret_padrao_desenvolvimento'
}