import type { IUserSafe } from '../database/users/entities.js'
import { RegisterDto } from '../dtos/registerUser.js'
import { LoginDto } from '../dtos/loginUser.js'
import { MongoUserRepository } from '../database/users/repository.js'
import { hashPassword, comparePassword } from '../utils/password.js'
import { signAccessToken } from '../utils/jwt.js'
import type { AuthRto } from '../rtos/auth.rto.js'
import { mapUserSafeToRto } from '../rtos/user.mapper.js'

const repo = new MongoUserRepository()

function toDateUTC(s?: string | null): Date | null {
    return s ? new Date(`${s}T00:00:00.000Z`) : null
}

export class AuthService {
    async register(input: RegisterDto): Promise<IUserSafe> {
        const exists = await repo.findByEmail(input.email)
        if (exists) {
            throw {
                status: 409,
                code: 'UNIQUE_EMAIL',
                message: 'Email already exists',
            }
        }
        const birthDate = toDateUTC(input.birthDate ?? null)
        const passwordHash = await hashPassword(input.password)
        const now = new Date()

        return repo.create({
            fullName: input.fullName,
            birthDate,
            email: input.email,
            passwordHash,
            role: 'USER',
            isActive: true,
            createdAt: now,
            updatedAt: now,
        })
    }

    async login(input: LoginDto): Promise<AuthRto> {
        const user = await repo.findByEmailWithPassword(input.email)
        if (!user) {
            throw {
                status: 401,
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
            }
        }

        const fits = await comparePassword(input.password, user.passwordHash)
        if (!fits) {
            throw {
                status: 401,
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
            }
        }

        if (!user.isActive) {
            throw {
                status: 403,
                code: 'USER_BLOCKED',
                message: 'Account is blocked',
            }
        }

        const token = signAccessToken({
            sub: user.id,
            role: user.role,
            email: user.email,
        })

        const safe: IUserSafe = {
            id: user.id,
            fullName: user.fullName,
            birthDate: user.birthDate,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }

        return { token, user: mapUserSafeToRto(safe) }
    }
}
