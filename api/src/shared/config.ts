export const config = {
    bcryptSaltRounds: Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || '10')
}