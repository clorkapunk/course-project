const {prisma} = require("../prisma/prisma-client");
const Roles = require('../config/roles')
const ActionTypes = require('../config/admin-history-action-types')


class UsersService {

    async getHistory({skip, take, initiatorField, initiatorSearch, victimField, victimSearch, from, to}){


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

}

module.exports = new UsersService();
