import { z } from 'zod'
import { toLowerTrimmed, trimString } from './helpers.js'
import { LoginDto } from '../dtos/loginUser.js'

export const LoginSchema: z.ZodType<LoginDto> = z
    .object({
        email: z.preprocess(toLowerTrimmed, z.string().email()),
        password: z.preprocess(trimString, z.string().min(6).max(72)),
    })
    .strict()

export type LoginSchemaInput = z.infer<typeof LoginSchema>
