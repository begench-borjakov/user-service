import { z } from 'zod'
import { trimString } from './helpers.js'

export const ChangePasswordSchema = z
    .object({
        currentPassword: z.preprocess(trimString, z.string().min(6).max(72)),
        newPassword: z.preprocess(trimString, z.string().min(6).max(72)),
    })
    .strict()
    .refine((value) => value.currentPassword !== value.newPassword, {
        message: 'newPassword must be different from currentPassword',
        path: ['newPassword'],
    })

export type ChangePasswordSchemaInput = z.infer<typeof ChangePasswordSchema>
