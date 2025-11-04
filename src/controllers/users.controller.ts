import type { Request, Response, NextFunction } from 'express'
import type { UsersQueryInput } from '../validations/users-query.schema.js'
import type { UpdateUserSchemaInput } from '../validations/updateUser.schema.js'
import { UsersService } from '../services/users.service.js'
import { mapUserSafeToRto, mapUsersSafeToRto } from '../rtos/user.mapper.js'

type IdParams = { id: string }

export class UsersController {
    private readonly service = new UsersService()

    getById = async (
        req: Request<IdParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const user = await this.service.getById(req.params.id)
            res.json(mapUserSafeToRto(user))
        } catch (err) {
            next(err)
        }
    }

    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const q = req.query as unknown as UsersQueryInput
            const result = await this.service.list(q)
            res.json({
                items: mapUsersSafeToRto(result.items),
                page: result.page,
                limit: result.limit,
                total: result.total,
                pages: result.pages,
            })
        } catch (err) {
            next(err)
        }
    }

    updatePartial = async (
        req: Request<IdParams, {}, UpdateUserSchemaInput>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const updated = await this.service.updatePartial(
                req.params.id,
                req.body
            )
            res.json(mapUserSafeToRto(updated))
        } catch (err) {
            next(err)
        }
    }

    block = async (
        req: Request<IdParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const updated = await this.service.block(req.params.id)
            res.json(mapUserSafeToRto(updated))
        } catch (err) {
            next(err)
        }
    }

    delete = async (
        req: Request<IdParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            await this.service.delete(req.params.id)
            res.status(204).end()
        } catch (err) {
            next(err)
        }
    }
}

export const usersController = new UsersController()
