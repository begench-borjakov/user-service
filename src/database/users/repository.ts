import { Types } from 'mongoose'
import { UserModel } from '../../database/models/model.js'
import type {
    IUserBase,
    IUserSafe,
    UpdateUserInput,
    SetActiveResult,
    EntityWithHash,
} from '../../database/users/entities.js'

export class MongoUserRepository {
    async create(data: IUserBase): Promise<IUserSafe> {
        const doc = await UserModel.create(data)

        return {
            id: doc._id.toString(),
            fullName: doc.fullName,
            birthDate: doc.birthDate,
            email: doc.email,
            role: doc.role,
            isActive: doc.isActive,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        }
    }

    async findByEmail(email: string): Promise<boolean> {
        const found = await UserModel.exists({ email })

        return found !== null
    }

    async findByEmailWithPassword(
        email: string
    ): Promise<EntityWithHash | null> {
        const doc = await UserModel.findOne({ email })
            .select('+passwordHash')
            .exec()

        if (!doc) return null

        return {
            id: doc._id.toString(),
            fullName: doc.fullName,
            birthDate: doc.birthDate,
            email: doc.email,
            passwordHash: doc.passwordHash!,
            role: doc.role,
            isActive: doc.isActive,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        }
    }

    async findById(id: string): Promise<IUserSafe | null> {
        if (!Types.ObjectId.isValid(id)) return null

        const doc = await UserModel.findById(id)
        if (!doc) return null

        return {
            id: doc._id.toString(),
            fullName: doc.fullName,
            birthDate: doc.birthDate,
            email: doc.email,
            role: doc.role,
            isActive: doc.isActive,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        }
    }

    async listRaw(params: {
        skip: number
        limit: number
        sort: Record<string, 1 | -1>
    }): Promise<{ items: IUserSafe[]; total: number }> {
        const [rows, total] = await Promise.all([
            UserModel.find({})
                .sort(params.sort)
                .skip(params.skip)
                .limit(params.limit),
            UserModel.countDocuments({}),
        ])

        const items: IUserSafe[] = rows.map((doc) => ({
            id: doc._id.toString(),
            fullName: doc.fullName,
            birthDate: doc.birthDate,
            email: doc.email,
            role: doc.role,
            isActive: doc.isActive,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        }))

        return { items, total }
    }

    async updatePartial(
        id: string,
        patch: UpdateUserInput
    ): Promise<IUserSafe | null> {
        if (!Types.ObjectId.isValid(id)) return null

        const doc = await UserModel.findByIdAndUpdate(
            id,
            { $set: patch },
            { new: true }
        )

        if (!doc) return null

        return {
            id: doc._id.toString(),
            fullName: doc.fullName,
            birthDate: doc.birthDate,
            email: doc.email,
            role: doc.role,
            isActive: doc.isActive,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        }
    }

    async setActive(
        id: string,
        isActive: boolean
    ): Promise<SetActiveResult | null> {
        if (!Types.ObjectId.isValid(id)) return null

        const doc = await UserModel.findByIdAndUpdate(
            id,
            { $set: { isActive } },
            { new: true }
        )

        if (!doc) return null

        return {
            id: doc._id.toString(),
            isActive: doc.isActive,
            updatedAt: doc.updatedAt,
        }
    }

    async deleteById(id: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(id)) return false
        const res = await UserModel.deleteOne({ _id: id }).exec()
        return res.deletedCount === 1
    }
}
