import type { IUserSafe, UserRole } from '../database/users/entities.js'
import type { RegisterSchemaInput } from '../validations/register.schema.js'
import type { LoginSchemaInput } from '../validations/login.schema.js'
import { MongoUserRepository } from '../database/users/repository.js'
import { hashPassword, comparePassword } from '../utils/password.js'
import { signAccessToken } from '../utils/jwt.js'
import type { AuthRto } from '../rtos/auth.rto.js'
import { mapUserSafeToRto } from '../rtos/user.mapper.js'

const repo = new MongoUserRepository()
const normalizeEmail = (email: string) => email.trim().toLowerCase()

export class AuthService {
    async register(input: RegisterSchemaInput): Promise<IUserSafe> {
        const email = normalizeEmail(input.email)
        const passwordHash = await hashPassword(input.password)
        const now = new Date()

        return repo.create({
            fullName: input.fullName,
            birthDate: input.birthDate ?? null,
            email,
            passwordHash,
            role: 'USER',
            isActive: true,
            createdAt: now,
            updatedAt: now,
        })
    }

    async login(input: LoginSchemaInput): Promise<AuthRto> {
        const email = normalizeEmail(input.email)

        const user = await repo.findByEmailWithPassword(email)
        if (!user) {
            throw {
                status: 401,
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
            }
        }

        const ok = await comparePassword(input.password, user.passwordHash)
        if (!ok) {
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
