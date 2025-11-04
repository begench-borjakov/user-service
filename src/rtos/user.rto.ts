import type { UserRole } from '../database/users/entities.js'

export interface UserRto {
    id: string
    fullName: string
    birthDate: string | null
    email: string
    role: UserRole
    isActive: boolean
    createdAt: string
    updatedAt: string
}
