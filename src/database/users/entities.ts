export type UserRole = 'ADMIN' | 'USER'

export interface IUserBase {
    fullName: string
    birthDate?: Date | null
    email: string
    passwordHash: string
    role: UserRole
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export type IUserSafe = Omit<IUserBase, 'passwordHash'> & {
    id: string
}

export interface CreateUserInput {
    fullName: string
    birthDate?: Date | null
    email: string
    password: string
    role?: UserRole
}

export interface UpdateUserInput {
    fullName?: string
    birthDate?: Date | null
}

export type UserSort =
    | 'createdAt:1'
    | 'createdAt:-1'
    | 'fullName:1'
    | 'fullName:-1'

export interface ListUsersParams {
    page?: number
    limit?: number
    sort?: UserSort
}

export interface ListUsersResult {
    items: IUserSafe[]
    page: number
    limit: number
    total: number
    pages: number
}

export interface AuthUserPayload {
    sub: string
    role: UserRole
    email?: string
}
