import jwt, {
    type Secret,
    type SignOptions,
    type JwtPayload,
    type Algorithm,
} from 'jsonwebtoken'
import type { AuthUserPayload } from '../database/users/entities.js'

const ISSUER = 'user-service'
const ALG: Algorithm = 'HS256'

function getEnv(name: string): string {
    const value = process.env[name]
    if (!value) throw new Error(`${name} is not set in environment`)
    return value
}

function getJwtSecret(): Secret {
    return getEnv('JWT_SECRET')
}
function getJwtExpiresIn(): SignOptions['expiresIn'] {
    return (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '1d'
}

function getRefreshSecret(): Secret {
    return getEnv('JWT_REFRESH_SECRET')
}
function getRefreshExpiresIn(): SignOptions['expiresIn'] {
    return (
        (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn']) || '7d'
    )
}

function isAuthPayload(value: unknown): value is AuthUserPayload & JwtPayload {
    if (typeof value !== 'object' || value === null) return false

    const obj = value as Record<string, unknown>

    const hasValidSub = typeof obj.sub === 'string'

    const hasValidRole = obj.role === 'ADMIN' || obj.role === 'USER'

    const hasValidEmail =
        obj.email === undefined || typeof obj.email === 'string'

    return hasValidSub && hasValidRole && hasValidEmail
}

export function signAccessToken(payload: AuthUserPayload): string {
    const secret: Secret = getJwtSecret()
    const options: SignOptions = {
        expiresIn: getJwtExpiresIn(),
        issuer: ISSUER,
        algorithm: ALG,
    }
    return jwt.sign(payload, secret, options)
}

export function verifyAccessToken(token: string): AuthUserPayload {
    const secret: Secret = getJwtSecret()

    const decoded = jwt.verify(token, secret, {
        issuer: ISSUER,
        algorithms: [ALG],
    })

    if (!isAuthPayload(decoded)) throw new Error('Invalid access token payload')
    return { sub: decoded.sub, role: decoded.role, email: decoded.email }
}

export function signRefreshToken(payload: AuthUserPayload): string {
    const secret: Secret = getRefreshSecret()
    const options: SignOptions = {
        expiresIn: getRefreshExpiresIn(),
        issuer: ISSUER,
        algorithm: ALG,
    }
    return jwt.sign(payload, secret, options)
}

export function verifyRefreshToken(token: string): AuthUserPayload {
    const secret: Secret = getRefreshSecret()
    const decoded = jwt.verify(token, secret, {
        issuer: ISSUER,
        algorithms: [ALG],
    })
    if (!isAuthPayload(decoded))
        throw new Error('Invalid refresh token payload')
    return { sub: decoded.sub, role: decoded.role, email: decoded.email }
}

export function getTokenFromAuthHeader(
    authHeader?: string | null
): string | null {
    if (!authHeader) return null
    const [type, token] = authHeader.trim().split(/\s+/)
    if (!type || !token) return null
    if (type.toLowerCase() !== 'bearer') return null
    return token
}
