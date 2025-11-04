import type { UsersQueryInput } from '../validations/users-query.schema.js'
import type { UpdateUserSchemaInput } from '../validations/updateUser.schema.js'
import type { ListUsersResult, IUserSafe } from '../database/users/entities.js'
import { MongoUserRepository } from '../database/users/repository.js'

const repo = new MongoUserRepository()

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
        return repo.list({
            page: query.page,
            limit: query.limit,
            sort: query.sort,
        })
    }

    async updatePartial(
        id: string,
        patch: UpdateUserSchemaInput
    ): Promise<IUserSafe> {
        const updated = await repo.updatePartial(id, {
            fullName: patch.fullName,
            birthDate: patch.birthDate ?? undefined,
        })
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
        const updated = await repo.setActive(id, false)
        if (!updated) {
            throw {
                status: 404,
                code: 'USER_NOT_FOUND',
                message: 'User not found',
            }
        }
        return updated
    }

    async unblock(id: string): Promise<IUserSafe> {
        const updated = await repo.setActive(id, true)
        if (!updated) {
            throw {
                status: 404,
                code: 'USER_NOT_FOUND',
                message: 'User not found',
            }
        }
        return updated
    }

    async delete(id: string): Promise<void> {
        const ok = await repo.deleteById(id)
        if (!ok) {
            throw {
                status: 404,
                code: 'USER_NOT_FOUND',
                message: 'User not found',
            }
        }
    }
}
