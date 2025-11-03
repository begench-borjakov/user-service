import type { Request, Response, NextFunction } from 'express'
import { UserModel } from '../database/models/model.js'

export async function requireActiveUser(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const auth = req.auth
    if (!auth) {
        res.status(401).json({ message: 'Unauthorized' })
        return
    }

    const doc = await UserModel.findById(auth.sub)
        .select({ isActive: 1 })
        .lean()

    if (!doc) {
        res.status(401).json({ message: 'Unauthorized' })
        return
    }

    const hasIsActive =
        typeof doc === 'object' &&
        doc !== null &&
        'isActive' in doc &&
        typeof (doc as Record<string, unknown>).isActive === 'boolean'

    if (!hasIsActive) {
        res.status(401).json({ message: 'Unauthorized' })
        return
    }

    if (!(doc as { isActive: boolean }).isActive) {
        res.status(403).json({ message: 'User is blocked' })
        return
    }

    next()
}
