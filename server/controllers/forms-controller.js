const {validationResult} = require('express-validator')
const ApiError = require("../exceptions/api-errors");
const formsService = require("../services/forms-service");
const templatesService = require("../services/templates-service");
const {checkValidationErrors} = require("../check-validation-errors");
const Roles = require("../config/roles");


class FormsController {

    async getFormById(req, res, next) {
        try {
            checkValidationErrors(req, next);

            const id = parseInt(req.params.id)
            const userId = req.user.id

            const form = await formsService.getById(id)
            const template = await templatesService.getById(form.templateId, userId)

            const response = formsService.combineFormWithTemplate(template, form)

            return res.json(response)
        } catch (err) {
            next(err)
        }
    }

    async getFormAnswersByUserId(req, res, next) {
        try {
            checkValidationErrors(req, next);

            const userId = parseInt(req.query.uid)
            const templateId = parseInt(req.query.tid)

            const form = await formsService.getByUserAndTemplate(userId, templateId)

            const template = await templatesService.getById(templateId)

            const response = formsService.combineFormWithTemplate(template, form)

            return res.json(response.questions)
        } catch (err) {
            next(err)
        }
    }

    async getUserForms(req, res, next) {
        try {
            checkValidationErrors(req, next);

            const {id} = req.user
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const sort = req.query.sort || "desc"
            const orderField = req.query.orderBy || "id"
            const search = req.query.search || ""
            const searchField = req.query.searchBy || 'title'

            const {forms, totalCount} = await formsService.getByUserId({
                userId: id,
                skip: (page - 1) * limit,
                take: limit,
                orderField,
                sort,
                searchField,
                search
            })


            return res.json({
                page,
                limit,
                pages: Math.ceil(totalCount / limit),
                total: totalCount,
                data: forms
            })
        } catch (err) {

        }
    }

    async createForm(req, res, next) {
        try {
            checkValidationErrors(req, next)

            const {templateId, answers} = req.body

            const form = await formsService.create({
                answers,
                templateId,
                userId: req.user.id,
            })

            return res.json(form)
        } catch (err) {
            next(err)
        }
    }

    async deleteForms(req, res, next){
        try {
            checkValidationErrors(req, next)

            const formsIds = req.body.ids
            const {id, role} = req.user

            console.log('formsIds',formsIds)
            console.log('user', id, role)

            let result
            if(role === Roles.Admin){
                result = await formsService.deleteAll(formsIds)
            }
            else{
                result = await formsService.deleteAll(formsIds, id)
            }

            return res.json(result)
        }catch (err){
            next(err)
        }
    }

    async updateForm(req, res, next){
        try {
            checkValidationErrors(req, next)

            const formId = parseInt(req.params.id)
            const answers = req.body.answers
            const {id, role} = req.user

            let result
            if(role === Roles.Admin){
                result = await formsService.update(formId, answers)
            }
            else{
                result = await formsService.update(formId, answers, id)
            }

            return res.json(result)
        }catch (err){
            next(err)
        }
    }

    async getFormByTemplate(req, res, next){
        try{
            checkValidationErrors(req, next)

            const userId = parseInt(req.query.uid)
            const templateId = parseInt(req.query.tid)

            const form = await formsService.getByUserAndTemplate(userId, templateId)

            return res.json(form)
        }catch (err){
            next(err)
        }
    }

    async getUserTemplatesForms(req, res,next){
        try {
            checkValidationErrors(req, next)

            const {id, role} = req.user
            const userId = parseInt(req.params.id)
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const sort = req.query.sort || "desc"
            const orderField = req.query.orderBy || "id"
            const search = req.query.search || ""
            const searchField = req.query.searchBy || 'title'

            if(id !== userId && role !== Roles.Admin){
                return next(ApiError.ForbiddenError())
            }

            const {forms, totalCount} = await formsService.getUserTemplates({
                userId,
                skip: (page - 1) * limit,
                take: limit,
                orderField,
                sort,
                searchField,
                search
            })

            return res.json({
                page,
                limit,
                pages: Math.ceil(totalCount / limit),
                total: totalCount,
                data: forms
            })

        }catch (err){
            next(err)
        }
    }

    async getFormsByTemplate(req, res, next){
        try {
            checkValidationErrors(req, next)

            const templateId = parseInt(req.params.id)
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const sort = req.query.sort || "desc"
            const orderField = req.query.orderBy || "createdAt"
            const search = req.query.search || ""
            const searchField = req.query.searchBy || ''

            const {forms, totalCount} = await formsService.getByTemplate({
                templateId,
                skip: (page - 1) * limit,
                take: limit,
                orderField,
                sort,
                searchField,
                search
            })

            return res.json({
                page,
                limit,
                pages: Math.ceil(totalCount / limit),
                total: totalCount,
                data: forms
            })
        }catch (err){
            next(err)
        }
    }

    async getForms(req, res,next){
        try{
            checkValidationErrors(req,next)

            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const sort = req.query.sort || "desc"
            const orderField = req.query.orderBy || "id"
            const search = req.query.search || ""
            const searchField = req.query.searchBy || 'title'

            const {forms, totalCount} = await formsService.get({
                skip: (page - 1) * limit,
                take: limit,
                orderField,
                sort,
                searchField,
                search
            })


            return res.json({
                page,
                limit,
                pages: Math.ceil(totalCount / limit),
                total: totalCount,
                data: forms
            })


        }catch (err){
            next(err)
        }
    }
}

module.exports = new FormsController();
