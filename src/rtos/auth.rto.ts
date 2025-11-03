import type { UserRto } from './user.rto.js'

export interface AuthRto {
    token: string
    user: UserRto
}
