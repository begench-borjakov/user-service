import { z } from 'zod'
import { trimString, toDateOrNull, isNotInFuture } from './helpers.js'
import { UpdateUserDto } from '../dtos/updateUser.js'

export const UpdateUserSchema: z.ZodType<UpdateUserDto> = z
    .object({
        fullName: z
            .preprocess(trimString, z.string().min(2).max(100))
            .optional(),
        birthDate: z
            .preprocess(toDateOrNull, z.union([z.date(), z.null()]))
            .refine(isNotInFuture, {
                message: 'birthDate must not be in the future',
            })
            .transform((v) =>
                v instanceof Date ? v.toISOString().slice(0, 10) : null
            )
            .optional(),
    })
    .strict()
    .refine((obj) => Object.keys(obj).length > 0, {
        message: 'Provide at least one field to update',
    })
export type UpdateUserSchemaInput = z.infer<typeof UpdateUserSchema>
