import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'
import { validateBody } from '../middlewares/validate.js'
import { RegisterSchema } from '../validations/register.schema.js'
import { LoginSchema } from '../validations/login.schema.js'

const authRoutes = Router()

authRoutes.post(
    '/register',
    validateBody(RegisterSchema),
    authController.register
)

authRoutes.post('/login', validateBody(LoginSchema), authController.login)

export default authRoutes
