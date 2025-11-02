import { z } from 'zod'
import {
    trimString,
    toDateOrNull,
    isNotInFuture,
    toLowerTrimmed,
} from './helpers.js'

export const RegisterSchema = z
    .object({
        fullName: z.preprocess(trimString, z.string().min(2).max(100)),
        birthDate: z
            .preprocess(toDateOrNull, z.union([z.date(), z.null()]))
            .optional()
            .refine(isNotInFuture, {
                message: 'birthDate must not be in the future',
            }),
        email: z.preprocess(toLowerTrimmed, z.string().email()),
        password: z.string().min(6).max(72),
    })
    .strict()

export type RegisterSchemaInput = z.infer<typeof RegisterSchema>
