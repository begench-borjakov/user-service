import { Schema } from 'mongoose'
import type { IUserBase } from '../users/entities.js'

export const UserSchema = new Schema<IUserBase>(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        birthDate: {
            type: Date,
            default: null,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            set: (v: string) => (typeof v === 'string' ? v.toLowerCase() : v),
            unique: true,
            index: true,
        },

        passwordHash: {
            type: String,
            required: true,
            select: false,
        },

        role: {
            type: String,
            enum: ['ADMIN', 'USER'],
            default: 'USER',
            index: true,
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,

        versionKey: false,
    }
)

UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ role: 1, isActive: 1, createdAt: -1 })
UserSchema.index({ createdAt: -1 })
