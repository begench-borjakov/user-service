import { z } from 'zod'

export const UsersQuerySchema = z
    .object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        sort: z
            .enum(['createdAt:1', 'createdAt:-1', 'fullName:1', 'fullName:-1'])
            .default('createdAt:-1'),
    })
    .strict()

export type UsersQueryInput = z.infer<typeof UsersQuerySchema>
