import { Router } from 'express'
import { usersController } from '../controllers/users.controller.js'
import { authMiddleware } from '../middlewares/auth.js'
import { requireActiveUser } from '../middlewares/requireActiveUser.js'
import { adminOnly } from '../middlewares/adminOnly.js'
import { allowAdminOrSelf } from '../middlewares/auth.js'
import {
    validateQuery,
    validateParams,
    validateBody,
} from '../middlewares/validate.js'
import { UsersQuerySchema } from '../validations/users-query.schema.js'
import { IdParamsSchema } from '../validations/id-params.schema.js'
import { UpdateUserSchema } from '../validations/updateUser.schema.js'

const usersRoutes = Router()

usersRoutes.use(authMiddleware, requireActiveUser)

usersRoutes.get(
    '/',
    adminOnly,
    validateQuery(UsersQuerySchema),
    usersController.list
)

usersRoutes.get(
    '/:id',
    validateParams(IdParamsSchema),
    allowAdminOrSelf,
    usersController.getById
)

usersRoutes.patch(
    '/:id',
    validateParams(IdParamsSchema),
    allowAdminOrSelf,
    validateBody(UpdateUserSchema),
    usersController.update
)

usersRoutes.patch(
    '/:id/block',
    validateParams(IdParamsSchema),
    allowAdminOrSelf,
    usersController.block
)

usersRoutes.delete(
    '/:id',
    validateParams(IdParamsSchema),
    allowAdminOrSelf,
    usersController.delete
)

export default usersRoutes
