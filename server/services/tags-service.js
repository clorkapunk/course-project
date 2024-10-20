const {prisma} = require("../prisma/prisma-client");


class TagsService {

    async getPaged({take, search}) {
        const filter = {
            where: {
                name: {
                    startsWith: search,
                    mode: 'insensitive'
                }
            }
        }

        const tags = await prisma.tag.findMany({
            take,
            ...filter
        })

        const totalCount = await prisma.tag.count({
            ...filter
        })

        return {
            tags,
            totalCount
        }
    }

}

module.exports = new TagsService();
