import bcrypt from 'bcryptjs'

export const MIN_PASSWORD_LENGTH = 6
export const MAX_PASSWORD_LENGTH_BCRYPT = 72

function parsePositiveInt(
    envValue: string | undefined,
    fallbackValue: number
): number {
    const parsedNumber = Number(envValue)
    const isValidPositiveInteger =
        Number.isInteger(parsedNumber) && parsedNumber > 0
    return isValidPositiveInteger ? parsedNumber : fallbackValue
}

const BCRYPT_SALT_ROUNDS: number = parsePositiveInt(
    process.env.BCRYPT_SALT_ROUNDS,
    12
)

export function isPasswordLengthValid(passwordPlain: string): boolean {
    return (
        passwordPlain.length >= MIN_PASSWORD_LENGTH &&
        passwordPlain.length <= MAX_PASSWORD_LENGTH_BCRYPT
    )
}

export async function hashPassword(passwordPlain: string): Promise<string> {
    if (!isPasswordLengthValid(passwordPlain)) {
        throw new Error(
            `Password length must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH_BCRYPT}`
        )
    }
    return bcrypt.hash(passwordPlain, BCRYPT_SALT_ROUNDS)
}

export async function comparePassword(
    passwordPlain: string,
    passwordHash: string
): Promise<boolean> {
    return bcrypt.compare(passwordPlain, passwordHash)
}
