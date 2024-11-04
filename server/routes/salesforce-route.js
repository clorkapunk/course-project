const Router = require('express').Router
const salesforceController = require('../controllers/salesforce-controller')
const {checkSchema} = require("express-validator");

const router = new Router()


router.get(
    '/salesforce/user/:id',
    checkSchema({
        id: {in: ['params'], notEmpty: true, isInt: true}
    }),
    salesforceController.getInfo
)


router.post(
    '/salesforce',
    checkSchema({
        id: {optional: true, isInt: true},
        firstname: {notEmpty: true, isString: true},
        lastname: {optional: true, isString: true},
        email: {notEmpty: true, isEmail: true},
        dob: {notEmpty: true, isDate: true},
        phone: {notEmpty: true, isMobilePhone: true},
    }),
    salesforceController.createAccount
)

router.put(
    "/salesforce",
    checkSchema({
        contactId: {notEmpty: true, isString: true},
        accountId: {notEmpty: true, isString: true},
        firstname: {notEmpty: true, isString: true},
        lastname: {optional: true, isString: true},
        email: {notEmpty: true, isEmail: true},
        dob: {notEmpty: true, isDate: true},
        phone: {notEmpty: true, isMobilePhone: true},
    }),
    salesforceController.updateAccount
)


module.exports = router;
