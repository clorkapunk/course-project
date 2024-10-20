const {prisma} = require("../prisma/prisma-client");
const templatesService = require("../services/templates-service")
const usersService = require("../services/users-service")
const ApiError = require("../exceptions/api-errors");
const ErrorCodes = require("../config/error-codes");

class FormsService {

    async getById(formId) {
        const form = await prisma.form.findFirst({
            where: {id: formId},
            select: {
                id: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        isActive: true,
                    }
                },
                createdAt: true,
                templateId: true,
                customString1Answer: true,
                customString2Answer: true,
                customString3Answer: true,
                customString4Answer: true,
                customInt1Answer: true,
                customInt2Answer: true,
                customInt3Answer: true,
                customInt4Answer: true,
                customText1Answer: true,
                customText2Answer: true,
                customText3Answer: true,
                customText4Answer: true,
                customBool1Answer: true,
                customBool2Answer: true,
                customBool3Answer: true,
                customBool4Answer: true,
            }
        })

        const {id, user, createdAt, templateId} = form


        return {
            id,
            user,
            createdAt,
            templateId,
            answers: this.formatAnswersFromDB(form)
        }

    }

    async getByUserAndTemplate(userId, filterTemplateId){
        let form = await prisma.form.findFirst({
            where: {
                userId,
                templateId: filterTemplateId
            },
            select: {
                id: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        isActive: true,
                    }
                },
                createdAt: true,
                templateId: true,
                customString1Answer: true,
                customString2Answer: true,
                customString3Answer: true,
                customString4Answer: true,
                customInt1Answer: true,
                customInt2Answer: true,
                customInt3Answer: true,
                customInt4Answer: true,
                customText1Answer: true,
                customText2Answer: true,
                customText3Answer: true,
                customText4Answer: true,
                customBool1Answer: true,
                customBool2Answer: true,
                customBool3Answer: true,
                customBool4Answer: true,
            }
        })

        if(!form){
            throw ApiError.BadRequest(
                ``,
                ErrorCodes.UserNotExist
            )
        }

        const {id, user, createdAt, templateId} = form


        return {
            id,
            user,
            createdAt,
            templateId,
            answers: this.formatAnswersFromDB(form)
        }
    }

    async create({userId, templateId, answers}) {
        return prisma.form.create({
            data: {
                userId,
                templateId,
                ...this.formatAnswersForDB(answers, "string"),
                ...this.formatAnswersForDB(answers, "int"),
                ...this.formatAnswersForDB(answers, "text"),
                ...this.formatAnswersForDB(answers, "bool")
            }
        })
    }

    formatAnswersForDB(answers, type) {
        let name = 'String'

        if (type === 'string') name = 'String'
        else if (type === 'text') name = 'Text'
        else if (type === 'int') name = 'Int'
        else if (type === 'bool') name = 'Bool'

        const arr = answers.filter(q => q.type === type).slice(0, 4).map((q, index) => {
            return {
                [`custom${name}${index + 1}Answer`]: q.answer
            }
        })

        return arr.reduce((acc, item) => ({
            ...acc,
            ...item
        }), {})
    }

    formatAnswersFromDB(form) {
        const answers = [];

        ['string', 'int', 'bool', 'text'].forEach(type => {
            let name = 'String'

            if (type === 'string') name = 'String'
            else if (type === 'text') name = 'Text'
            else if (type === 'int') name = 'Int'
            else if (type === 'bool') name = 'Bool'

            for (let i = 1; i <= 4; i++) {
                const stateName = `custom${name}${i}Answer`
                let answer = form[stateName]
                if (answer === null) continue
                let temp = {
                    type,
                    answer: form[`custom${name}${i}Answer`]
                }
                answers.push(temp)
            }
        })

        return answers
    }

    combineFormWithTemplate(template, form) {
        const {questions, ...templateData} = template
        const {answers, ...formData} = form

        const resultQuestions = [];

        ['string', 'int', 'bool', 'text'].forEach(type => {
            const typedQuestions = questions.filter(q => q.type === type)
            const typedAnswers =  answers.filter(a => a.type === type)

            typedQuestions.forEach((question, index) => {

                let answer = null
                if(typedAnswers.length >= index + 1){
                    answer = typedAnswers[index].answer
                }

                const temp = {
                    type: question.type,
                    question: question.question,
                    description: question.description,
                    answer
                }

                resultQuestions.push(temp)
            })



        })

        return {
            templateData,
            formData,
            questions: resultQuestions
        }


    }
}

module.exports = new FormsService();
