const {prisma} = require("../prisma/prisma-client");
const ApiError = require("../exceptions/api-errors");
const ErrorCodes = require("../config/error-codes");


class LikesService {

    async create({templateId, userId}) {
        const template = await prisma.template.findFirst({where: {id: templateId}})
        if (!template) {
            throw ApiError.BadRequest(
                `Template with id ${templateId} not found`,
                ErrorCodes.WrongPassword // need to change
            )
        }
        const user = await prisma.template.findFirst({where: {id: userId}})
        if (!user) {
            throw ApiError.BadRequest(
                `User with id ${templateId} not found`,
                ErrorCodes.WrongPassword // need to change
            )
        }

        await prisma.like.create({
            data: {
                templateId,
                userId
            }
        })
    }

    async delete({id, userId}) {
        return prisma.like.delete({
            where: {id, userId}
        });
    }

}

module.exports = new LikesService();
