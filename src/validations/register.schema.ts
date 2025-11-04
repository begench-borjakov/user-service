import { z } from 'zod'
import {
    trimString,
    toDateOrNull,
    isNotInFuture,
    toLowerTrimmed,
} from './helpers.js'
import { RegisterDto } from '../dtos/registerUser.js'

export const RegisterSchema: z.ZodType<RegisterDto> = z
    .object({
        fullName: z.preprocess(trimString, z.string().min(2).max(100)),
        birthDate: z
            .preprocess(toDateOrNull, z.union([z.date(), z.null()]))
            .refine(isNotInFuture, {
                message: 'birthDate must not be in the future',
            })
            .transform((v) =>
                v instanceof Date ? v.toISOString().slice(0, 10) : null
            )
            .optional(),
        email: z.preprocess(toLowerTrimmed, z.string().email()),
        password: z.string().min(6).max(72),
    })
    .strict()

export type RegisterSchemaInput = z.infer<typeof RegisterSchema>
