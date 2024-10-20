const Router = require('express').Router
const formsController = require('../controllers/forms-controller')
const roleMiddleware = require('../middlewares/role-middleware')
const Roles = require("../config/roles");
const {body, checkSchema} = require('express-validator')

const router = new Router()


router.get(
    "/forms/:id",
    checkSchema({
       id: {in: ['params'], isInt: true},
    }),
    formsController.getFormById
)

router.get(
    "/form-answers",
    checkSchema({
        tid: {in: ['query'], isInt: true},
        uid: {in: ['query'], isInt: true},
    }),
    formsController.getFormAnswersByUserId
)


router.post(
    "/forms",
    checkSchema({
       answers: {notEmpty: true, isArray: true},
       templateId: {notEmpty: true, isInt: true}
    }),
    formsController.createForm
)




module.exports = router;
