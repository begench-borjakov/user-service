import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { ZodError, type ZodTypeAny } from 'zod'

function handleZodError(res: Response, error: ZodError): void {
    res.status(400).json({
        error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request',
            details: error.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message,
            })),
        },
    })
}

export function validateBody(schema: ZodTypeAny): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body)
            next()
        } catch (err) {
            if (err instanceof ZodError) return handleZodError(res, err)
            next(err)
        }
    }
}

export function validateQuery(schema: ZodTypeAny): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.query)
            next()
        } catch (err) {
            if (err instanceof ZodError) return handleZodError(res, err)
            next(err)
        }
    }
}

export function validateParams(schema: ZodTypeAny): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.params)
            next()
        } catch (err) {
            if (err instanceof ZodError) return handleZodError(res, err)
            next(err)
        }
    }
}
