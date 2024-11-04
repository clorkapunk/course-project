const {prisma} = require("../prisma/prisma-client");
const Roles = require('../config/roles')
const ActionTypes = require('../config/admin-history-action-types')
const ApiError = require("../exceptions/api-errors");
const ErrorCodes = require("../config/error-codes");
const UserDto = require("../dtos/user-dto");
const bcrypt = require("bcrypt");
const tokenService = require("./token-service");
const salesforceService = require('./salesforce-service')


class UsersService {

    async getHistory({skip, take, initiatorField, initiatorSearch, victimField, victimSearch, from, to}) {


        const filter = {
            where: {
                initiator: {
                    [initiatorField]: {
                        contains: initiatorSearch,
                        mode: "insensitive"
                    }
                },
                victim: {
                    [victimField]: {
                        contains: victimSearch,
                        mode: "insensitive"
                    }
                },
                createdAt: {
                    gte: from,
                    lte: to
                }

            }
        }

        const totalCount = await prisma.adminHistory.count({
            ...filter
        })

        const history = await prisma.adminHistory.findMany({
            take,
            skip,
            orderBy: {
                id: 'desc'
            },
            relationLoadStrategy: 'join',
            select: {
                id: true,
                initiator: {
                    select: {
                        id: true,
                        username: true,
                        isActive: true,
                        email: true,
                        role: true
                    }
                },
                victim: {
                    select: {
                        id: true,
                        username: true,
                        isActive: true,
                        email: true,
                        role: true
                    }
                },
                action_type: true,
                new_value: true,
                createdAt: true
            },
            ...filter
        })

        return {totalCount, history}
    }


    async getUsers({skip, take, orderField, sort, searchField, search}) {
        const filter = {
            where: {
                [searchField]: {
                    contains: search,
                    mode: "insensitive"
                }
            }
        }

        const users = await prisma.user.findMany({
            select: {
                username: true,
                email: true,
                isActive: true,
                role: true,
                id: true
            },
            orderBy: {
                [orderField]: sort
            },
            take,
            skip,
            ...filter
        });
        const totalCount = await prisma.user.count(filter)
        return {users, totalCount}
    }

    async updateUsersField(ids, field, value, adminId) {
        const users = await prisma.user.updateMany({
            where: {
                id: {
                    in: ids
                }
            },
            data: {
                [field]: value
            }
        });

        let action_type = ActionTypes.ChangeRole

        if (field === 'isActive') {
            action_type = ActionTypes.ChangeStatus;
        } else if (field === 'role') {
            action_type = ActionTypes.ChangeRole;
        }


        await prisma.adminHistory.createMany({
            data: ids.map(victimId => ({
                victimId,
                initiatorId: adminId,
                action_type,
                new_value: value.toString()
            }))
        })

        return users

    }

    async getById(id) {
        console.log(id)
        const user = await prisma.user.findFirst({
            where: {
                id
            },
            select: {
                id: true,
                isActive: true,
                email: true,
                role: true,
                username: true,
                salesforceAccountId: true,
                jiraAccountId: true
            }
        })

        if (!user) {
            throw ApiError.BadRequest(
                `User with id ${id} not found`,
                ErrorCodes.UserNotExist
            )
        }

        return user
    }

    async deleteMany(ids) {
        const salesforceIds = await prisma.user.findMany({
            where: {
                id: {
                    in: ids
                },
                salesforceAccountId: {
                    not: null
                }
            },
            select: {
                salesforceAccountId: true
            }
        })

        salesforceService.deleteAccounts(salesforceIds.map(i => i.salesforceAccountId))

        return prisma.user.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        })
    }

    async validateUserData(userData) {
        const user = await prisma.user.findFirst({
            where: {id: userData.id},
            select: {
                id: true,
                role: true,
                isActive: true,
                email: true,
                username: true,
            }
        })

        if (!user) {
            throw ApiError.BadRequest(
                `User with id ${userData.id} not found`,
                ErrorCodes.UserNotExist
            )
        }

        return new UserDto(user)
    }

    async changePassword(userId, oldPassword, newPassword) {
        const user = await prisma.user.findFirst({where: {id: userId}})

        if (!user) {
            throw ApiError.BadRequest(`User with email address ${email} does not exist`, ErrorCodes.UserNotExist)
        }

        const isPassEqual = await bcrypt.compare(oldPassword, user.password)

        if (!isPassEqual) {
            throw ApiError.BadRequest("Wrong password", ErrorCodes.WrongPassword)
        }

        let hashedPassword = null
        if (newPassword) {
            const salt = await bcrypt.genSalt(10)
            hashedPassword = await bcrypt.hash(newPassword, salt)

        }

        const updatedUser = await prisma.user.update({
            where: {id: userId},
            data: {
                password: hashedPassword
            }
        })

        return new UserDto(updatedUser)
    }

    async changeUsername(userId, username) {
        const user = await prisma.user.findFirst({where: {id: userId}})

        if (!user) {
            throw ApiError.BadRequest(`User with email address ${email} does not exist`, ErrorCodes.UserNotExist)
        }

        const updatedUser = await prisma.user.update({
            where: {id: userId},
            data: {
                username
            }
        })

        return new UserDto(updatedUser)
    }

    async addSalesforceAccountId(userId, accountId) {
        return prisma.user.update({
            where: {id: userId},
            data: {
                salesforceAccountId: accountId
            }
        })
    }

    async deleteSalesforceAccountId(userId){
        return prisma.user.update({
            where: {id: userId},
            data: {
                salesforceAccountId: null
            }
        })
    }

    async addJiraAccountId(userId, accountId){
        return prisma.user.update({
            where: {id: userId},
            data: {
                jiraAccountId: accountId
            }
        })
    }

    async deleteJiraAccountId(userId){
        return prisma.user.update({
            where: {id: userId},
            data: {
                jiraAccountId: null
            }
        })
    }

}

module.exports = new UsersService();
