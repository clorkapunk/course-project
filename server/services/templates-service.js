const {prisma} = require("../prisma/prisma-client");
const ApiError = require("../exceptions/api-errors");
const ErrorCodes = require("../config/error-codes");
const googleDriveService = require('./google-drive-service')
const {Prisma} = require("@prisma/client");
const {log} = require("debug");


class TemplatesService {

    async getLatest({take, skip, toDate}) {

        const templates = await prisma.template.findMany({
            take, skip,
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                image: true,
                mode: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        isActive: true,
                    }
                },
                topic: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                tags: {
                    select: {
                        tag: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            where: {
                createdAt: {
                    gte: toDate
                },
            }
        })

        const totalCount = await prisma.template.count({
            where: {
                createdAt: {
                    gte: toDate
                },
            }
        })

        const result = templates.map(template => ({
            ...template,
            tags: template.tags.map(tagRelation => tagRelation.tag)
        }))

        return {templates: result, totalCount}
    }

    async getPopular({take, skip}) {
        const templates = await prisma.template.findMany({
            take, skip,
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                image: true,
                mode: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        isActive: true,
                    }
                },
                topic: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                tags: {
                    select: {
                        tag: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        form: true
                    }
                }
            },
            orderBy: {
                form: {
                    _count: 'desc'
                }
            },
            where: {
                form: {
                    some: {}
                }
            }
        })

        const totalCount = await prisma.template.count({
            where: {
                form: {
                    some: {}
                }
            }
        })
        const result = templates.map(template => ({
            ...template,
            tags: template.tags.map(tagRelation => tagRelation.tag)
        }))

        return {templates: result, totalCount}
    }

    async getSearched({take, skip, search, tags}) {

        let searchQuery = ''
        if (search !== '') {
            searchQuery = search
                .split(' ')
                .map(term => `${term}:*`)
                .join(' | ');
        }

        console.log('tags: ', tags)


        console.log(`searching for: ${searchQuery}`)

        const templates = await prisma.$queryRaw(
            Prisma.sql`SELECT 
                t.id AS template_id, 
                t.title, 
                t.description, 
                t."createdAt", 
                t.image, 
                t.mode, 
                u.id AS user_id, 
                u.username, 
                u.email, 
                u."isActive",
                top.id AS topic_id, 
                top.name AS topic_name,
                COALESCE(array_agg(DISTINCT jsonb_build_object('id', tg.id, 'name', tg.name)) FILTER (WHERE tg.id IS NOT NULL), '{}') AS tags,
                array_agg(DISTINCT jsonb_build_object('id', c.id, 'text', c.text)) FILTER (WHERE c.id IS NOT NULL) AS comments
              FROM "templates" t
              LEFT JOIN "users" u ON t."userId" = u.id
              LEFT JOIN "topics" top ON t."topicId" = top.id
              LEFT JOIN "templates_tags" tt ON t.id = tt."templateId"
              LEFT JOIN "tags" tg ON tt."tagId" = tg.id
              LEFT JOIN "comments" c ON t.id = c."templateId"
              WHERE 
                (to_tsvector('simple', t.title || ' ' || t.description || ' ' || coalesce(t."customString1Question", '') || ' ' || coalesce(t."customString1Description", '') 
                || ' ' || coalesce(t."customString2Question", '') || ' ' || coalesce(t."customString2Description", '') || ' ' || coalesce(t."customString3Question", '') 
                || ' ' || coalesce(t."customString3Description", '') || ' ' || coalesce(t."customString4Question", '') || ' ' || coalesce(t."customString4Description", '') 
                || ' ' || coalesce(t."customInt1Question", '') || ' ' || coalesce(t."customInt1Description", '') || ' ' || coalesce(t."customInt2Question", '') 
                || ' ' || coalesce(t."customInt2Description", '') || ' ' || coalesce(t."customInt3Question", '') || ' ' || coalesce(t."customInt3Description", '') 
                || ' ' || coalesce(t."customInt4Question", '') || ' ' || coalesce(t."customInt4Description", '') || ' ' || coalesce(t."customText1Question", '') 
                || ' ' || coalesce(t."customText1Description", '') || ' ' || coalesce(t."customText2Question", '') || ' ' || coalesce(t."customText2Description", '') 
                || ' ' || coalesce(t."customText3Question", '') || ' ' || coalesce(t."customText3Description", '') || ' ' || coalesce(t."customText4Question", '') 
                || ' ' || coalesce(t."customText4Description", '') || ' ' || coalesce(t."customBool1Question", '') || ' ' || coalesce(t."customBool1Description", '') 
                || ' ' || coalesce(t."customBool2Question", '') || ' ' || coalesce(t."customBool2Description", '') || ' ' || coalesce(t."customBool3Question", '') 
                || ' ' || coalesce(t."customBool3Description", '') || ' ' || coalesce(t."customBool4Question", '') || ' ' || coalesce(t."customBool4Description", '')) 
                @@ to_tsquery('simple', ${searchQuery})
                OR to_tsvector('simple', c.text) @@ to_tsquery('simple', ${searchQuery}))
                ${tags.length > 0 ? Prisma.sql`
                AND t.id IN (
                    SELECT tt."templateId"
                    FROM "templates_tags" tt
                    WHERE tt."tagId" IN (${Prisma.join(tags)})
                    GROUP BY tt."templateId"
                    HAVING COUNT(DISTINCT tt."tagId") = ${tags.length}
                )` : Prisma.empty}
              GROUP BY t.id, u.id, top.id
              LIMIT ${take}
              OFFSET ${skip};
    `
        );


        const count = await prisma.$queryRaw(
            Prisma.sql`SELECT COUNT(DISTINCT t.id) AS total_count
              FROM "templates" t
              LEFT JOIN "users" u ON t."userId" = u.id
              LEFT JOIN "topics" top ON t."topicId" = top.id
              LEFT JOIN "templates_tags" tt ON t.id = tt."templateId"
              LEFT JOIN "tags" tg ON tt."tagId" = tg.id
              LEFT JOIN "comments" c ON t.id = c."templateId"
              WHERE 
                (to_tsvector('simple', t.title || ' ' || t.description || ' ' || coalesce(t."customString1Question", '') || ' ' || coalesce(t."customString1Description", '') 
                || ' ' || coalesce(t."customString2Question", '') || ' ' || coalesce(t."customString2Description", '') || ' ' || coalesce(t."customString3Question", '') 
                || ' ' || coalesce(t."customString3Description", '') || ' ' || coalesce(t."customString4Question", '') || ' ' || coalesce(t."customString4Description", '') 
                || ' ' || coalesce(t."customInt1Question", '') || ' ' || coalesce(t."customInt1Description", '') || ' ' || coalesce(t."customInt2Question", '') 
                || ' ' || coalesce(t."customInt2Description", '') || ' ' || coalesce(t."customInt3Question", '') || ' ' || coalesce(t."customInt3Description", '') 
                || ' ' || coalesce(t."customInt4Question", '') || ' ' || coalesce(t."customInt4Description", '') || ' ' || coalesce(t."customText1Question", '') 
                || ' ' || coalesce(t."customText1Description", '') || ' ' || coalesce(t."customText2Question", '') || ' ' || coalesce(t."customText2Description", '') 
                || ' ' || coalesce(t."customText3Question", '') || ' ' || coalesce(t."customText3Description", '') || ' ' || coalesce(t."customText4Question", '') 
                || ' ' || coalesce(t."customText4Description", '') || ' ' || coalesce(t."customBool1Question", '') || ' ' || coalesce(t."customBool1Description", '') 
                || ' ' || coalesce(t."customBool2Question", '') || ' ' || coalesce(t."customBool2Description", '') || ' ' || coalesce(t."customBool3Question", '') 
                || ' ' || coalesce(t."customBool3Description", '') || ' ' || coalesce(t."customBool4Question", '') || ' ' || coalesce(t."customBool4Description", '')) 
                @@ to_tsquery('simple', ${searchQuery})
                OR to_tsvector('simple', c.text) @@ to_tsquery('simple', ${searchQuery}))
                ${tags.length > 0 ? Prisma.sql`
                AND t.id IN (
                    SELECT tt_sub."templateId"
                    FROM "templates_tags" tt_sub
                    JOIN "tags" tg_sub ON tt_sub."tagId" = tg_sub.id
                    WHERE tg_sub.id IN (${Prisma.join(tags)})
                    GROUP BY tt_sub."templateId"
                    HAVING COUNT(DISTINCT tg_sub.id) = ${tags.length}
                )` : Prisma.empty}
    `
        );


        const result = templates.map(template => {
            return {
                id: template.template_id,
                title: template.title,
                description: template.description,
                createdAt: template.createdAt,
                image: template.image,
                mode: template.mode,
                user: {
                    id: template.user_id,
                    username: template.username,
                    email: template.email,
                    isActive: template.isActive
                },
                topic: {
                    id: template.topic_id,
                    name: template.topic_name
                },
                tags: template.tags || []
            };
        });

        return {templates: result, totalCount: Number(count[0].total_count)}
    }

    async getById(templateId, userId) {
        let filter = {where: {id: templateId}}

        if (userId) {
            filter = {where: {id: templateId, userId}}
        }

        const template = await prisma.template.findFirst({
            ...filter,
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                image: true,
                mode: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        isActive: true,
                    }
                },
                topic: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                tags: {
                    select: {
                        tag: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                customString1State: true,
                customString1Question: true,
                customString1Description: true,
                customString2State: true,
                customString2Question: true,
                customString2Description: true,
                customString3State: true,
                customString3Question: true,
                customString3Description: true,
                customString4State: true,
                customString4Question: true,
                customString4Description: true,
                customInt1State: true,
                customInt1Question: true,
                customInt1Description: true,
                customInt2State: true,
                customInt2Question: true,
                customInt2Description: true,
                customInt3State: true,
                customInt3Question: true,
                customInt3Description: true,
                customInt4State: true,
                customInt4Question: true,
                customInt4Description: true,
                customText1State: true,
                customText1Question: true,
                customText1Description: true,
                customText2State: true,
                customText2Question: true,
                customText2Description: true,
                customText3State: true,
                customText3Question: true,
                customText3Description: true,
                customText4State: true,
                customText4Question: true,
                customText4Description: true,
                customBool1State: true,
                customBool1Question: true,
                customBool1Description: true,
                customBool2State: true,
                customBool2Question: true,
                customBool2Description: true,
                customBool3State: true,
                customBool3Question: true,
                customBool3Description: true,
                customBool4State: true,
                customBool4Question: true,
                customBool4Description: true,
            }
        })

        if (!template) {
            throw ApiError.BadRequest(
                `Template with id ${templateId} not found`,
                ErrorCodes.UserNotExist
            )
        }

        const {id, title, description, createdAt, image, mode, user, topic} = template

        return {
            id,
            title,
            description,
            createdAt,
            image,
            mode,
            user,
            topic,
            tags: this.formatTagsFromDB(template?.tags),
            questions: this.formatQuestionsFromDB(template)
        }
    }

    async getByUserId({userId, skip, take, orderField, sort, searchField, search}) {
        let orderBy = {}

        if (orderField === 'form') {
            orderBy = {
                form: {
                    _count: sort
                }
            }
        } else {
            orderBy = {
                [orderField]: sort
            }
        }

        const templates = await prisma.template.findMany({
            skip, take,
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                mode: true,
                image: true,
                tags: {
                    select: {
                        tag: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                topic: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        form: true
                    }
                }
            },
            where: {
                userId,
                [searchField]: {
                    contains: search,
                    mode: "insensitive"
                }
            },
            orderBy
        })

        const totalCount = await prisma.template.count({
            where: {
                userId,
                [searchField]: {
                    contains: search,
                    mode: "insensitive"
                }
            },
        })

        return {templates, totalCount}
    }

    async create({title, description, userId, topicId, image, mode, questions, tags}) {

        const topic = await prisma.topic.findFirst({where: {id: topicId}})
        if (!topic) {
            throw ApiError.BadRequest(
                `Topic with id ${topicId} not found`,
                ErrorCodes.WrongPassword // need to change
            )
        }

        const templateQuestions = {
            ...this.formatQuestionsForDB(questions, "string"),
            ...this.formatQuestionsForDB(questions, "int"),
            ...this.formatQuestionsForDB(questions, "bool"),
            ...this.formatQuestionsForDB(questions, "text"),
        }

        const response = await prisma.template.create({
            data: {
                title,
                description,
                userId,
                topicId,
                image,
                mode,
                ...templateQuestions,
                tags: {
                    create: tags.map(tagName => ({
                        tag: {
                            connectOrCreate: {
                                where: {name: tagName},       // Проверяем, существует ли тег
                                create: {name: tagName},      // Создаем новый тег, если его нет
                            },
                        },
                    })),
                },
            },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
            }
        })

        return response

    }

    async deleteAll(templatesIds, userId) {
        let filter = {
            where: {id: {in: templatesIds}}
        }
        if (userId) {
            filter = {
                where: {id: {in: templatesIds}, userId}
            }
        }
        const templates = await prisma.template.findMany({
            ...filter
        })

        templates.forEach(template => {
            if (template.image === null) return
            googleDriveService.deleteImage(template.image)
        })

        return prisma.template.deleteMany({
            ...filter
        })
    }

    async update(templateId, data, userId) {
        let filter = {
            where: {id: templateId}
        }
        let template
        if (userId) {
            filter = {
                where: {id: templateId, userId: userId}
            }
            template = await this.getById(templateId, userId)
        } else {
            template = await this.getById(templateId)
        }


        if (!template) {
            return null;
        }

        if (template.image && data.image) {
            try {
                await googleDriveService.deleteImage(template.image)
            } catch (err) {
                console.log(err)
            }
        }

        let tagsToDisconnect = [...template.tags].filter(x => {
            return !data.tags.includes(x.name)
        })
        let tagsToConnect = [...data.tags].filter(x => !template.tags.map(i => i.name).includes(x))


        const templateQuestions = {
            ...this.formatQuestionsForDB(data.questions, "string"),
            ...this.formatQuestionsForDB(data.questions, "int"),
            ...this.formatQuestionsForDB(data.questions, "bool"),
            ...this.formatQuestionsForDB(data.questions, "text"),
        }

        console.log(templateQuestions)

        let updateData = {
            title: data.title,
            description: data.description,
            mode: data.mode,
            ...templateQuestions
        }

        if (tagsToDisconnect.length > 0 || tagsToConnect) {
            updateData = {
                ...updateData,
                tags: {
                    deleteMany: {
                        tagId: {
                            in: tagsToDisconnect.map(i => i.id), // Указываем теги, которые нужно удалить
                        },
                    },
                    create: tagsToConnect.map(tagName => ({
                        tag: {
                            connectOrCreate: {
                                where: {name: tagName},       // Проверяем, существует ли тег
                                create: {name: tagName},      // Создаем новый тег, если его нет
                            },
                        },
                    })),
                }
            }
        }
        if (data.image) {
            updateData = {
                ...updateData,
                image: data.image
            }
        }
        if (data.topicId) {
            updateData = {
                ...updateData,
                topic: {
                    connect: {
                        id: data.topicId
                    }
                }
            }
        }


        return prisma.template.update({
            ...filter,
            data: {
                ...updateData
            },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
            }
        })
    }

    async getByTags({tags, skip, take}) {

        if(tags.length === 0 ){
            return {templates: [], totalCount: 0}
        }

        const templates = await prisma.template.findMany({
            take, skip,
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                image: true,
                mode: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        isActive: true,
                    }
                },
                topic: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                tags: {
                    select: {
                        tag: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        form: true
                    }
                }
            },
            where: {
                AND: tags.map(tagId => ({
                    tags: {
                        some: {
                            tag: {
                                id: tagId,
                            }
                        },
                    },
                })),
            }
        })


        const totalCount = await prisma.template.count({
            where: {
                AND: tags.map(tagId => ({
                    tags: {
                        some: {
                            tag: {
                                id: tagId,
                            }
                        },
                    },
                })),
            }
        })

        const result = templates.map(template => ({
            ...template,
            tags: template.tags.map(tagRelation => tagRelation.tag)
        }))

        return {templates: result, totalCount}
    }

    async addTags({templateId, tags}) {
        return prisma.template.update({
            where: {id: templateId},
            data: {
                postTags: {
                    create: tags.map(tag => ({
                        tag: {
                            connectOrCreate: {
                                where: {name: tag},
                                create: {name: tag},
                            },
                        },
                    })),
                },
            },
            include: {
                postTags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });
    }

    async deleteTags({templateId, tags}) {
        const tagsToDelete = await prisma.tag.findMany({
            where: {
                name: {in: tags}
            },
        });

        await prisma.templateTag.deleteMany({
            where: {
                templateId,
                tagId: {in: tagsToDelete.map(tag => tag.id)},
            },
        });
    }

    formatQuestionsForDB(questions, type, isUpdate = false) {
        let name = 'String'

        if (type === 'string') name = 'String';
        else if (type === 'text') name = 'Text';
        else if (type === 'int') name = 'Int';
        else if (type === 'bool') name = 'Bool';

        const arr = []

        const filteredArr = questions.filter(q => q.type === type).slice(0, 4)

        for (let i = 1; i <= 4; i++) {
            if (filteredArr.length > i - 1) {
                arr.push({
                    [`custom${name}${i}State`]: 'PRESENT_REQUIRED',
                    [`custom${name}${i}Question`]: filteredArr[i - 1].question,
                    [`custom${name}${i}Description`]: filteredArr[i - 1].description
                })
            } else {
                arr.push({
                    [`custom${name}${i}State`]: 'NOT_PRESENT',
                    [`custom${name}${i}Question`]: null,
                    [`custom${name}${i}Description`]: null
                })
            }
        }

        return arr.reduce((acc, item) => ({
            ...acc,
            ...item
        }), {})
    }

    formatQuestionsFromDB(template) {
        const questions = [];

        ['string', 'int', 'bool', 'text'].forEach(type => {
            let name = 'String'

            if (type === 'string') name = 'String'
            else if (type === 'text') name = 'Text'
            else if (type === 'int') name = 'Int'
            else if (type === 'bool') name = 'Bool'

            for (let i = 1; i <= 4; i++) {
                const stateName = `custom${name}${i}State`
                let state = template[stateName]
                if (state === 'NOT_PRESENT') continue
                let temp = {
                    type,
                    question: template[`custom${name}${i}Question`],
                    description: template[`custom${name}${i}Description`]
                }
                questions.push(temp)
            }
        })

        return questions
    }

    formatTagsFromDB(tags) {
        return tags.map(tagObject => {
            return {
                id: tagObject.tag.id,
                name: tagObject.tag.name
            };
        });
    }


}

module.exports = new TemplatesService();
