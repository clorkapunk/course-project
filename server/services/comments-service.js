const {prisma} = require("../prisma/prisma-client");
const ApiError = require("../exceptions/api-errors");
const ErrorCodes = require("../config/error-codes");


class CommentsService {

    async create({text, templateId, userId}) {
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

        await prisma.comment.create({
            data: {
                templateId,
                userId,
                text
            }
        })
    }

    async delete(id) {
        return prisma.comment.delete({
            where: {id}
        });
    }

    async edit({id, text}) {
        return prisma.comment.update({
            where: {id},
            data: {text}
        })
    }

}

module.exports = new CommentsService();
