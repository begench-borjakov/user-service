import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

function hasStatus(v: unknown): v is { status: number } {
    return (
        typeof v === 'object' &&
        v !== null &&
        'status' in v &&
        typeof (v as { status: unknown }).status === 'number'
    )
}

function hasMongoDupCode(
    v: unknown
): v is { code: number; keyValue?: Record<string, unknown> } {
    return (
        typeof v === 'object' &&
        v !== null &&
        'code' in v &&
        (v as { code: unknown }).code === 11000
    )
}

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (err instanceof ZodError) {
        res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request',
                details: err.issues.map((i) => ({
                    path: i.path.join('.'),
                    message: i.message,
                })),
            },
        })
        return
    }

    if (hasMongoDupCode(err)) {
        const key = err.keyValue ? Object.keys(err.keyValue)[0] : 'key'
        res.status(409).json({
            error: { code: 'DUPLICATE', message: `Duplicate ${key}` },
        })
        return
    }

    const status = hasStatus(err) ? err.status : 500
    const message = err instanceof Error ? err.message : 'Internal Server Error'

    res.status(status >= 400 && status < 600 ? status : 500).json({
        error: { code: 'INTERNAL_ERROR', message },
    })
}
