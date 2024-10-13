const usersService = require('../services/users-service')
const {validationResult} = require("express-validator");
const ApiError = require("../exceptions/api-errors");
const {prisma} = require("../prisma/prisma-client");


class AuthController {
    async getUsers(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const firstErrorCode = errors.array()[0].path
                return next(ApiError.BadRequest(
                    "Validation failed",
                    `validation_failed_${firstErrorCode}`,
                    errors.array())
                )
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sort = req.query.sort || "desc"
            const orderField = req.query.orderBy || "id"
            const search = req.query.search || ""
            const searchField = req.query.searchBy || 'email'

            const startIndex = (page - 1) * limit;

            const {users, totalCount} = await usersService.getUsers({
                skip: startIndex,
                take: limit,
                orderField,
                sort,
                searchField,
                search
            })

            setTimeout(() => {
                return res.json({
                    page,
                    limit,
                    total: totalCount,
                    pages: Math.ceil(totalCount / limit),
                    data: users
                })
            }, 0)

        } catch (err) {
            next(err)
        }
    }

    async getHistory(req, res, next) {
        try {
            const history = await prisma.adminHistory.findMany({})
            return res.json({data: history})
        } catch (err) {
            next(err)
        }
    }

    async updateUsersRole(req, res, next) {
        try {


            const errors = validationResult(req)
            const {ids, role} = req.body

            if (!errors.isEmpty()) {
                const firstErrorCode = errors.array()[0].path
                return next(ApiError.BadRequest(
                    "Validation failed.",
                    `validation_failed_${firstErrorCode}`,
                    errors.array())
                )
            }

            await usersService.updateUsersField(ids, 'role', role, req.user?.id)

            return res.status(204).send()
        } catch (err) {
            next(err)
        }


    }

    async updateUsersStatus(req, res, next) {
        try {
            const errors = validationResult(req)
            const {ids, status} = req.body

            if (!errors.isEmpty()) {
                const firstErrorCode = errors.array()[0].path
                return next(ApiError.BadRequest(
                    "Validation failed.",
                    `validation_failed_${firstErrorCode}`,
                    errors.array())
                )
            }

            await usersService.updateUsersField(ids, 'isActive', status, req.user?.id)

            return res.status(204).send()
        } catch (err) {
            next(err)
        }
    }


}

module.exports = new AuthController();
