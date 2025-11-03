import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { getTokenFromAuthHeader, verifyAccessToken } from '../utils/jwt.js'

export interface AuthContext {
    sub: string
    role: 'ADMIN' | 'USER'
    email?: string
}

declare module 'express-serve-static-core' {
    interface Request {
        auth?: AuthContext
    }
}

export const authMiddleware: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const header = req.header('authorization')
    const token = getTokenFromAuthHeader(header)
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' })
        return
    }
    try {
        const payload = verifyAccessToken(token)
        req.auth = {
            sub: payload.sub,
            role: payload.role,
            email: payload.email,
        }
        next()
    } catch {
        res.status(401).json({ message: 'Unauthorized' })
    }
}

export function allowAdmin(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (req.auth?.role === 'ADMIN') {
        next()
        return
    }
    res.status(403).json({ message: 'Forbidden' })
}

export function allowAdminOrSelf(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (req.auth?.role === 'ADMIN' || req.auth?.sub === req.params.id) {
        next()
        return
    }
    res.status(403).json({ message: 'Forbidden' })
}
