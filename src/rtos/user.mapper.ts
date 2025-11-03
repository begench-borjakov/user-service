import type { IUserSafe } from '../database/users/entities.js'
import type { UserRto } from './user.rto.js'

function toIso(value: Date | null): string | null {
    return value ? value.toISOString() : null
}

export function mapUserSafeToRto(user: IUserSafe): UserRto {
    return {
        id: user.id,
        fullName: user.fullName,
        birthDate: toIso(user.birthDate),
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    }
}

export function mapUsersSafeToRto(users: IUserSafe[]): UserRto[] {
    return users.map(mapUserSafeToRto)
}
