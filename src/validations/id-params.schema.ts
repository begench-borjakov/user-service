import { z } from 'zod'
import { Types } from 'mongoose'

export const IdParamsSchema = z
    .object({
        id: z.string().refine(Types.ObjectId.isValid, 'Invalid ObjectId'),
    })
    .strict()

export type IdParamsInput = z.infer<typeof IdParamsSchema>
