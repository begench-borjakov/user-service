import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

function hasStatus(error: unknown): error is { status: number } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        typeof (error as { status: unknown }).status === 'number'
    )
}

function hasMongoDupCode(
    error: unknown
): error is { code: number; keyValue?: Record<string, unknown> } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: unknown }).code === 11000
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
