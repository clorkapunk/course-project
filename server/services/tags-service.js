const {prisma} = require("../prisma/prisma-client");


class TagsService {

    async get({skip, take, search, exclude}) {
        const filter = {
            where: {
                name: {
                    startsWith: search,
                    mode: 'insensitive'
                },
                id: {
                    notIn: exclude
                }
            }
        }

        const tags = await prisma.tag.findMany({
            skip,
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


    async getPopular({take}) {

        const tags = await prisma.tag.findMany({
            take,
            select: {
              id: true,
              name: true,
              _count: {
                  select: {
                      templates: true
                  }
              }
            },
            orderBy: {
                templates: {
                    _count: 'desc'
                }
            }
        })



        return {
            tags,
            take
        }
    }
}

module.exports = new TagsService();
