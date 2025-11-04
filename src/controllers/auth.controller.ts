import type { Request, Response, NextFunction } from 'express'
import type { RegisterSchemaInput } from '../validations/register.schema.js'
import type { LoginSchemaInput } from '../validations/login.schema.js'
import { AuthService } from '../services/auth.service.js'
import { mapUserSafeToRto } from '../rtos/user.mapper.js'

export class AuthController {
    private readonly service = new AuthService()

    register = async (
        req: Request<{}, {}, RegisterSchemaInput>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const created = await this.service.register(req.body)
            res.status(201).json(mapUserSafeToRto(created))
        } catch (err) {
            next(err)
        }
    }

    login = async (
        req: Request<{}, {}, LoginSchemaInput>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const auth = await this.service.login(req.body)
            res.json(auth)
        } catch (err) {
            next(err)
        }
    }
}

export const authController = new AuthController()
