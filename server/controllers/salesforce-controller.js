const {validationResult} = require('express-validator')
const ApiError = require("../exceptions/api-errors");
const {checkValidationErrors} = require("../check-validation-errors");
const salesforceService = require("../services/salesforce-service");
const usersService = require("../services/users-service")
const jsforce = require('jsforce');
const {log} = require("debug");
const Roles = require("../config/roles");



class SalesforceController {

    async getInfo(req, res, next) {
        try {
            const errors = checkValidationErrors(req, next)
            if(errors) return

            const id = parseInt(req.params.id)

            const conn = await salesforceService.authorize()
            const response = await salesforceService.getInfoByUserId(conn, id)

            return res.json({
                id: response.Id,
                firstname: response.FirstName,
                lastname: response.LastName,
                email: response.Email,
                dob: response.Birthdate,
                phone: response.MobilePhone,
                accountId: response.AccountId
            })
        } catch (err) {
            next(err)
        }
    }

    async createAccount(req, res, next) {
        try {
            const error = checkValidationErrors(req, next);
            if (error) return;

            let id = req.user.id
            const {role} = req.user

            if(req.body.id && role !== Roles.Admin){
                return next(ApiError.ForbiddenError())
            }

            if(req.body.id){
                id = req.body.id
            }

            const { firstname, lastname, email, dob, phone } = req.body;

            const conn = await salesforceService.authorize()
            const account = await salesforceService.createAccount(conn, `${firstname} ${lastname}`)
            const contact = await salesforceService.createContact(conn, account.id, {firstname, lastname, email, dob, phone})

            await usersService.addSalesforceAccountId(id, account.id)

            return res.status(200).json({ message: 'Account and Contact created successfully', accountId: account.id, contactId: contact.id });
        } catch (err) {


            next(err)
        }
    }


    async updateAccount(req, res, next) {
        try {
            const error = checkValidationErrors(req, next);
            if (error) return;

            let userId = req.user.id
            const {role} = req.user
            const { firstname, lastname, email, dob, phone, contactId, accountId } = req.body;

            if(role !== Roles.Admin){
                const user = await usersService.getById(userId)
                if(!user?.salesforceAccountId || user.salesforceAccountId !== accountId){
                    return next(ApiError.ForbiddenError())
                }
            }

            const conn = await salesforceService.authorize()
            const account = await salesforceService.updateAccount(conn, accountId, `${firstname} ${lastname}`)
            const contact = await salesforceService.updateContact(conn, contactId, {firstname, lastname, email, dob, phone})


            return res.status(200).json({ message: 'Account and Contact updated successfully', accountId: account.id, contactId: contact.id });
        } catch (err) {
            next(err)
        }
    }
}

module.exports = new SalesforceController();
