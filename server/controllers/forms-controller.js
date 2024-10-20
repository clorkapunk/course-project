const {validationResult} = require('express-validator')
const ApiError = require("../exceptions/api-errors");
const formsService = require("../services/forms-service");
const templatesService = require("../services/templates-service");
const {checkValidationErrors} = require("../check-validation-errors");


class FormsController {

    async getFormById(req, res, next) {
        try {
            checkValidationErrors(req, next);

            const id = parseInt(req.params.id) || 1

            const form = await formsService.getById(id)
            const template = await templatesService.getById(form.templateId)

            const response = formsService.combineFormWithTemplate(template, form)

            return res.json(response)
        }
        catch (err){
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
        }
        catch (err){
            next(err)
        }
    }


    async createForm(req, res, next) {
        try{
            checkValidationErrors(req, next)

            const {templateId, answers} = req.body

            const form = await formsService.create({
                answers,
                templateId,
                userId: req.user.id,
            })

            return res.json(form)
        }
        catch (err){
            next(err)
        }
    }
}

module.exports = new FormsController();
