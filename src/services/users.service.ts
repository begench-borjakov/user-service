import type { UsersQueryInput } from '../validations/users-query.schema.js'
import { UpdateUserDto } from '../dtos/updateUser.js'
import type {
    ListUsersResult,
    IUserSafe,
    UserSort,
    UpdateUserInput,
} from '../database/users/entities.js'
import { MongoUserRepository } from '../database/users/repository.js'

const repo = new MongoUserRepository()

function toDateUTC(s?: string | null): Date | null {
    return s ? new Date(`${s}T00:00:00.000Z`) : null
}

export class UsersService {
    async getById(id: string): Promise<IUserSafe> {
        const user = await repo.findById(id)
        if (!user) {
            throw {
                status: 404,
                code: 'USER_NOT_FOUND',
                message: 'User not found',
            }
        }
        return user
    }

    async list(query: UsersQueryInput): Promise<ListUsersResult> {
        const page = query.page
        const limit = query.limit
        const skip = (page - 1) * limit

        const sortMap: Record<UserSort, Record<string, 1 | -1>> = {
            'createdAt:1': { createdAt: 1 },
            'createdAt:-1': { createdAt: -1 },
            'fullName:1': { fullName: 1 },
            'fullName:-1': { fullName: -1 },
        }

        const { items, total } = await repo.listRaw({
            skip,
            limit,
            sort: sortMap[query.sort],
        })

        const pages = Math.max(1, Math.ceil(total / limit))

        return { items, page, limit, total, pages }
    }

    async update(id: string, dto: UpdateUserDto): Promise<IUserSafe> {
        const patch: UpdateUserInput = {}

        if (dto.fullName !== undefined) {
            patch.fullName = dto.fullName
        }

        if (dto.birthDate !== undefined) {
            patch.birthDate =
                dto.birthDate === null ? null : toDateUTC(dto.birthDate)
        }

        const updated = await repo.updatePartial(id, patch)
        if (!updated) {
            throw {
                status: 404,
                code: 'USER_NOT_FOUND',
                message: 'User not found',
            }
        }
        return updated
    }

    async block(id: string): Promise<IUserSafe> {
        const result = await repo.setActive(id, false)
        if (!result) {
            throw {
                status: 404,
                code: 'USER_NOT_FOUND',
                message: 'User not found',
            }
        }

        const fullUser = await repo.findById(id)
        if (!fullUser) {
            throw {
                status: 404,
                code: 'USER_NOT_FOUND',
                message: 'User not found',
            }
        }
        return fullUser
    }

    async unblock(id: string): Promise<IUserSafe> {
        const result = await repo.setActive(id, true)
        if (!result) {
            throw {
                status: 404,
                code: 'USER_NOT_FOUND',
                message: 'User not found',
            }
        }

        const user = await repo.findById(id)
        if (!user) {
            throw {
                status: 404,
                code: 'USER_NOT_FOUND',
                message: 'User not found',
            }
        }

        return user
    }

    async delete(id: string): Promise<void> {
        const user = await repo.deleteById(id)
        if (!user) {
            throw {
                status: 404,
                code: 'USER_NOT_FOUND',
                message: 'User not found',
            }
        }
    }
}
