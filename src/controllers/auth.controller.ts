import type { Request, Response } from 'express'
import { RegisterDto } from '../dtos/registerUser.js'
import { LoginDto } from '../dtos/loginUser.js'
import { AuthService } from '../services/auth.service.js'
import { mapUserSafeToRto } from '../rtos/user.mapper.js'

export class AuthController {
    private readonly service = new AuthService()

    register = async (req: Request<{}, {}, RegisterDto>, res: Response) => {
        const created = await this.service.register(req.body)
        res.status(201).json(mapUserSafeToRto(created))
    }

    login = async (req: Request<{}, {}, LoginDto>, res: Response) => {
        const auth = await this.service.login(req.body)
        res.json(auth)
    }
}

export const authController = new AuthController()
