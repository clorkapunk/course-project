const {prisma} = require("../prisma/prisma-client");
const ApiError = require("../exceptions/api-errors");
const ErrorCodes = require("../config/error-codes");
const {Prisma} = require("@prisma/client");


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

        return {templates, totalCount}
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

        return {templates, totalCount}
    }

    async getSearched({take, skip, search}) {


        const searchQuery = search
            .split(' ')
            .map(term => `${term}:*`)
            .join(' | ');


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
                        tg.id AS tag_id, 
                        tg.name AS tag_name,
                        c.id AS comment_id, 
                        c.text AS comment_text
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
                        @@ to_tsquery('simple', ${searchQuery}))
                        OR to_tsvector('simple', c.text) @@ to_tsquery('simple', ${searchQuery})
                      LIMIT ${take}
                      OFFSET ${skip};
                `);

        const totalCount = await prisma.$queryRaw(
              Prisma.sql`SELECT COUNT(*)
                          FROM "templates" t
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
                                @@ to_tsquery('simple', ${searchQuery}))
                                OR to_tsvector('simple', c.text) @@ to_tsquery('simple', ${searchQuery})
                              LIMIT ${take}
                              OFFSET ${skip};
                `);

        const groupedTemplates = templates.reduce((acc, row) => {
            const template = acc.find(t => t.id === row.template_id);

            if (template) {
                template.tags.push({id: row.tag_id, name: row.tag_name});
            } else {
                acc.push({
                    id: row.template_id,
                    title: row.title,
                    description: row.description,
                    createdAt: row.createdAt,
                    image: row.image,
                    mode: row.mode,
                    user: {
                        id: row.user_id,
                        username: row.username,
                        email: row.email,
                        isActive: row.isActive
                    },
                    topic: {
                        id: row.topic_id,
                        name: row.topic_name
                    },
                    tags: row.tag_id ? [{id: row.tag_id, name: row.tag_name}] : []
                });
            }

            return acc;
        }, []);

        return {templates: groupedTemplates, totalCount: Number(totalCount[0].count)}
    }

    async getById(templateId) {
        const template = await prisma.template.findFirst({
            where: {
                id: templateId
            },
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

    formatQuestionsForDB(questions, type) {
        let name = 'String'

        if (type === 'string') name = 'String'
        else if (type === 'text') name = 'Text'
        else if (type === 'int') name = 'Int'
        else if (type === 'bool') name = 'Bool'

        const arr = questions.filter(q => q.type === type).slice(0, 4).map((q, index) => {
            return {
                [`custom${name}${index + 1}State`]: 'PRESENT_REQUIRED',
                [`custom${name}${index + 1}Question`]: q.question,
                [`custom${name}${index + 1}Description`]: q.description
            }
        })

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
