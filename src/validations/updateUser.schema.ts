import { z } from 'zod'
import { trimString, toDateOrNull, isNotInFuture } from './helpers.js'

export const UpdateUserSchema = z
    .object({
        fullName: z
            .preprocess(trimString, z.string().min(2).max(100))
            .optional(),
        birthDate: z
            .preprocess(toDateOrNull, z.union([z.date(), z.null()]))
            .optional()
            .refine(isNotInFuture, {
                message: 'birthDate must not be in the future',
            }),
    })
    .strict()
    .refine((obj) => Object.keys(obj).length > 0, {
        message: 'Provide at least one field to update',
    })

export type UpdateUserSchemaInput = z.infer<typeof UpdateUserSchema>
