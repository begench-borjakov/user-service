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

    try {
        const doc = await UserModel.findById(auth.sub)
            .select('isActive')
            .lean<{ isActive: boolean } | null>()

        if (!doc) {
            res.status(401).json({ message: 'Unauthorized' })
            return
        }

        if (!doc.isActive) {
            res.status(403).json({ message: 'User is blocked' })
            return
        }

        next()
    } catch (err) {
        next(err)
    }
}
