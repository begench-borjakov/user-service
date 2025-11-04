import type { Request, Response, NextFunction } from 'express'
import type { UsersQueryInput } from '../validations/users-query.schema.js'
import { UpdateUserDto } from '../dtos/updateUser.js'
import { UsersService } from '../services/users.service.js'
import { mapUserSafeToRto, mapUsersSafeToRto } from '../rtos/user.mapper.js'
import { IdParams } from '../database/users/entities.js'

export class UsersController {
    private readonly service = new UsersService()

    getById = async (req: Request<IdParams>, res: Response) => {
        const user = await this.service.getById(req.params.id)
        res.json(mapUserSafeToRto(user))
    }

    list = async (req: Request, res: Response) => {
        const query = req.query as unknown as UsersQueryInput
        const result = await this.service.list(query)
        res.json({
            items: mapUsersSafeToRto(result.items),
            page: result.page,
            limit: result.limit,
            total: result.total,
            pages: result.pages,
        })
    }

    update = async (
        req: Request<IdParams, {}, UpdateUserDto>,
        res: Response
    ) => {
        const updated = await this.service.update(req.params.id, req.body)
        res.json(mapUserSafeToRto(updated))
    }

    block = async (req: Request<IdParams>, res: Response) => {
        const updated = await this.service.block(req.params.id)
        res.json(mapUserSafeToRto(updated))
    }

    delete = async (req: Request<IdParams>, res: Response) => {
        await this.service.delete(req.params.id)
        res.status(204).end()
    }
}

export const usersController = new UsersController()
