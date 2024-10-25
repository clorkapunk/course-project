const usersService = require('../services/users-service')
const {validationResult} = require("express-validator");
const ApiError = require("../exceptions/api-errors");
const {prisma} = require("../prisma/prisma-client");
const {checkValidationErrors} = require("../check-validation-errors");


class UsersController {
    async getUsers(req, res, next) {
        try {
            checkValidationErrors(req, next)

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

            checkValidationErrors(req, next)

            const limit = 20
            const page = parseInt(req.query.page) ||  1
            const aSearchBy = req.query.aSearchBy || 'username'
            const aSearch = req.query.aSearch || ''
            const uSearchBy = req.query.uSearchBy || 'username'
            const uSearch = req.query.uSearch || ''
            const from = new Date(req.query.from) || new Date('2024-01-01')
            const to = new Date(req.query.to) || new Date()

            from.setHours(0)
            from.setMinutes(0)
            from.setSeconds(0)

            to.setHours(23)
            to.setMinutes(59)
            to.setSeconds(59)

            const skip = (page - 1) * limit


            const {totalCount, history} = await usersService.getHistory({
                skip,
                take: limit,
                initiatorField: aSearchBy,
                initiatorSearch: aSearch,
                victimField: uSearchBy,
                victimSearch: uSearch,
                from,
                to
            })



            return res.json({
                page,
                limit,
                total: totalCount,
                pages: Math.ceil(totalCount / limit),
                data: history
            })
        } catch (err) {
            next(err)
        }
    }

    async updateUsersRole(req, res, next) {
        try {


            checkValidationErrors(req, next)
            const {ids, role} = req.body


            await usersService.updateUsersField(ids, 'role', role, req.user?.id)

            return res.status(204).send()
        } catch (err) {
            next(err)
        }


    }

    async updateUsersStatus(req, res, next) {
        try {
            checkValidationErrors(req, next)
            const {ids, status} = req.body


            await usersService.updateUsersField(ids, 'isActive', status, req.user?.id)

            return res.status(204).send()
        } catch (err) {
            next(err)
        }
    }

    async deleteUsers(req, res, next){
        try {
            checkValidationErrors(req, next)

            const ids = req.body.ids

            const users = await usersService.deleteMany(ids)

            return res.json(users)
        }
        catch (err){
            next(err)
        }
    }
}

module.exports = new UsersController();
