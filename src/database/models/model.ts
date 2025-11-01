import mongoose, { Model, HydratedDocument } from 'mongoose'
import { UserSchema } from './schema.js'
import type { IUserBase } from '../users/entities.js'

export type IUserDoc = HydratedDocument<IUserBase>

export type IUserModel = Model<IUserBase>

export const UserModel: IUserModel = (() => {
    try {
        return mongoose.model<IUserBase>('User')
    } catch {
        return mongoose.model<IUserBase>('User', UserSchema)
    }
})()
