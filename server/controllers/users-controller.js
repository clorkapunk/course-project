const usersService = require('../services/users-service')
const {validationResult} = require("express-validator");
const ApiError = require("../exceptions/api-errors");
const {prisma} = require("../prisma/prisma-client");
const {checkValidationErrors} = require("../check-validation-errors");
const tokenService = require("../services/token-service");
const authService = require("../services/auth-service");
const Roles = require("../config/roles");

class UsersController {
    async getUser(req, res, next){
        try {
            const error = checkValidationErrors(req, next);
            if (error) return;

            const id = parseInt(req.params.id)
            const user = await usersService.getById(id)

            return res.json(user)
        }catch (err){
            next(err)
        }
    }

    async getUsers(req, res, next) {
        try {
            const error = checkValidationErrors(req, next);
            if (error) return;

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

            const error = checkValidationErrors(req, next);
            if (error) return;

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

            const error = checkValidationErrors(req, next);
            if (error) return;

            const {ids, role} = req.body


            await usersService.updateUsersField(ids, 'role', role, req.user?.id)

            return res.status(204).send()
        } catch (err) {
            next(err)
        }


    }

    async updateUsersStatus(req, res, next) {
        try {
            const error = checkValidationErrors(req, next);
            if (error) return;

            const {ids, status} = req.body


            await usersService.updateUsersField(ids, 'isActive', status, req.user?.id)

            return res.status(204).send()
        } catch (err) {
            next(err)
        }
    }

    async deleteUsers(req, res, next){
        try {
            const error = checkValidationErrors(req, next);
            if (error) return;

            const ids = req.body.ids

            const users = await usersService.deleteMany(ids)

            return res.json(users)
        }
        catch (err){
            next(err)
        }
    }

    async changeUser(req, res, next){
        try {
            const error = checkValidationErrors(req, next);
            if (error) return;

            let id = req.user.id
            const {role} = req.user


            if(req.body.id && role !== Roles.Admin){
                return next(ApiError.ForbiddenError())
            }

            if(req.body.id){
                id = req.body.id
            }

            const username = req.body.username
            const oldPassword = req.body.oldPassword
            const newPassword = req.body.newPassword

            let userDto;

            if(oldPassword && newPassword){
                userDto = await usersService.changePassword(id, oldPassword, newPassword)
            }
            if(username) {
                userDto = await usersService.changeUsername(id, username)
            }

            if(req.body.id){
                const tokens = tokenService.generateTokens({...userDto})
                await tokenService.saveToken(userDto.id, tokens.refreshToken)
                return res.json();
            }
            else{
                const tokens = tokenService.generateTokens({...userDto})
                await tokenService.saveToken(userDto.id, tokens.refreshToken)
                authService.setCookie(res, 'refreshToken', tokens.refreshToken)
                return res.json({
                    accessToken: tokens.accessToken
                });
            }
        }
        catch (err){
            next(err)
        }
    }
}

module.exports = new UsersController();
