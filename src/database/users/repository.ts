import { Types } from 'mongoose'
import { UserModel } from '../../database/models/model.js'
import type {
    IUserBase,
    IUserSafe,
    UserSort,
    ListUsersParams,
    ListUsersResult,
} from '../../database/users/entities.js'

type Row = (Omit<IUserBase, 'passwordHash'> & { passwordHash?: string }) & {
    _id: Types.ObjectId
}
type Entity = Omit<IUserBase, 'passwordHash'> & {
    id: string
    passwordHash?: string
}

type RowWithHash = IUserBase & { _id: Types.ObjectId }
type EntityWithHash = IUserBase & { id: string }

function mapRow(row: Row): Entity {
    return {
        id: row._id.toString(),
        fullName: row.fullName,
        birthDate: row.birthDate,
        email: row.email,
        passwordHash: row.passwordHash,
        role: row.role,
        isActive: row.isActive,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    }
}

function toSafe(u: Entity): IUserSafe {
    const { passwordHash: _drop, ...safe } = u
    return safe as IUserSafe
}

export interface IUserRepository {
    create(data: IUserBase): Promise<IUserSafe>
    findByEmail(email: string): Promise<IUserSafe | null>
    findByEmailWithPassword(
        email: string
    ): Promise<(IUserBase & { id: string }) | null>
    findById(id: string): Promise<IUserSafe | null>
    list(params?: ListUsersParams): Promise<ListUsersResult>
    updatePartial(
        id: string,
        patch: Partial<Pick<IUserBase, 'fullName' | 'birthDate'>>
    ): Promise<IUserSafe | null>
    setActive(id: string, isActive: boolean): Promise<IUserSafe | null>
    deleteById(id: string): Promise<boolean>
}

// ===== реализация (простая) =====
export class MongoUserRepository implements IUserRepository {
    async create(data: IUserBase): Promise<IUserSafe> {
        const doc = await UserModel.create(data)
        return toSafe(mapRow(doc.toObject() as Row))
    }

    async findByEmail(email: string): Promise<IUserSafe | null> {
        const doc = await UserModel.findOne({ email }).lean<Row>().exec()
        return doc ? toSafe(mapRow(doc)) : null
    }

    async findByEmailWithPassword(
        email: string
    ): Promise<EntityWithHash | null> {
        const doc = await UserModel.findOne({ email })
            .select('+passwordHash')
            .lean<RowWithHash>()
            .exec()

        return doc ? (mapRow(doc) as EntityWithHash) : null
    }

    async findById(id: string): Promise<IUserSafe | null> {
        if (!Types.ObjectId.isValid(id)) return null
        const doc = await UserModel.findById(id).lean<Row>().exec()
        return doc ? toSafe(mapRow(doc)) : null
    }

    async list(params?: ListUsersParams): Promise<ListUsersResult> {
        const page = Math.max(1, Math.trunc(params?.page ?? 1))
        const limit = Math.min(
            100,
            Math.max(1, Math.trunc(params?.limit ?? 20))
        )
        const skip = (page - 1) * limit

        const sortKey: UserSort = params?.sort ?? 'createdAt:-1'
        const sortMap: Record<UserSort, Record<string, 1 | -1>> = {
            'createdAt:1': { createdAt: 1 },
            'createdAt:-1': { createdAt: -1 },
            'fullName:1': { fullName: 1 },
            'fullName:-1': { fullName: -1 },
        }
        const sort = sortMap[sortKey] ?? { createdAt: -1 }

        const [rows, total] = await Promise.all([
            UserModel.find({}, { passwordHash: 0 })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean<Row[]>()
                .exec(),
            UserModel.countDocuments({}).exec(),
        ])

        const items = rows.map((r) => toSafe(mapRow(r)))
        const pages = Math.max(1, Math.ceil(total / limit))
        return { items, page, limit, total, pages }
    }

    async updatePartial(
        id: string,
        patch: Partial<Pick<IUserBase, 'fullName' | 'birthDate'>>
    ): Promise<IUserSafe | null> {
        if (!Types.ObjectId.isValid(id)) return null

        const doc = await UserModel.findByIdAndUpdate(
            id,
            { $set: { ...patch, updatedAt: new Date() } },
            { new: true, projection: { passwordHash: 0 } }
        )
            .lean<Row>()
            .exec()

        return doc ? toSafe(mapRow(doc)) : null
    }

    async setActive(id: string, isActive: boolean): Promise<IUserSafe | null> {
        if (!Types.ObjectId.isValid(id)) return null

        const doc = await UserModel.findByIdAndUpdate(
            id,
            { $set: { isActive, updatedAt: new Date() } },
            { new: true, projection: { passwordHash: 0 } }
        )
            .lean<Row>()
            .exec()

        return doc ? toSafe(mapRow(doc)) : null
    }

    async deleteById(id: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(id)) return false
        const res = await UserModel.deleteOne({ _id: id }).exec()
        return res.deletedCount === 1
    }
}
