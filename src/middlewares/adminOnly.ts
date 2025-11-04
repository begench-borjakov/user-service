import type { Request, Response, NextFunction } from 'express'

export function adminOnly(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const role = req.auth?.role
    if (!role) {
        res.status(401).json({ message: 'Unauthorized' })
        return
    }
    if (role !== 'ADMIN') {
        res.status(403).json({ message: 'Forbidden' })
        return
    }
    next()
}
