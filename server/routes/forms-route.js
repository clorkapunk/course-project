const Router = require('express').Router
const formsController = require('../controllers/forms-controller')
const roleMiddleware = require('../middlewares/role-middleware')
const Roles = require("../config/roles");
const {body, checkSchema} = require('express-validator')
const authMiddleware = require('../middlewares/auth-middleware')
const router = new Router()


router.get(
    "/forms/:id",
    checkSchema({
        id: {in: ['params'], isInt: true},
    }),
    formsController.getFormById
)

router.get(
    "/forms",
    checkSchema({
        uid: {in: ['query'], isInt: true},
        tid: {in: ['query'], isInt: true}
    }),
    formsController.getFormByTemplate
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

router.delete(
    '/forms',
    authMiddleware,
    checkSchema({
        ids: {notEmpty: true, isArray: true}
    }),
    formsController.deleteForms
)

// user forms
router.get(
    '/forms/user/:id',
    checkSchema({
        id: {in: ['params'], isInt: true},
        page: {in: ['query'], isInt: true},
        limit: {in: ['query'], isInt: true},
        sort: {in: ['query'], optional: true, isIn: {options: [['asc', 'desc']]}},
        orderBy: {
            in: ['query'],
            optional: true,
            isIn: {options: [['title', 'email', 'createdAt']]}
        },
        searchBy: {in: ['query'], optional: true, isIn: {options: [['title', 'email', 'username']]}},
        search: {in: ['query'], optional: true}
    }),
    formsController.getUserForms
)

router.patch(
    '/forms/:id',
    checkSchema({
        id: {in: ['params'], isInt: true},
        answers: {notEmpty: true, isArray: true}
    }),
    formsController.updateForm
)

// forms related to certain template
// router.get(
//     '/forms/template/:id',
//     checkSchema({
//
//     }),
//     // formsController.get
// )

// forms related to all templates created by user
router.get(
    '/forms/user-templates/:id',
    checkSchema({
        id: {in: ['params'], isInt: true},
        page: {in: ['query'], isInt: true},
        limit: {in: ['query'], isInt: true},
        sort: {in: ['query'], optional: true, isIn: {options: [['asc', 'desc']]}},
        orderBy: {
            in: ['query'],
            optional: true,
            isIn: {options: [['title', 'username', 'email', 'createdAt']]}
        },
        searchBy: {in: ['query'], optional: true, isIn: {options: [['title', 'email', 'username']]}},
        search: {in: ['query'], optional: true}
    }),
    formsController.getUserTemplatesForms
)

router.get(
    '/forms/template/:id',
    roleMiddleware(Roles.Admin),
    checkSchema({
        id: {in: ['params'], isInt: true},
        page: {in: ['query'], isInt: true},
        limit: {in: ['query'], isInt: true},
        sort: {in: ['query'], optional: true, isIn: {options: [['asc', 'desc']]}},
        orderBy: {
            in: ['query'],
            optional: true,
            isIn: {options: [['title', 'username', 'email', 'createdAt']]}
        },
        searchBy: {in: ['query'], optional: true, isIn: {options: [['title', 'email', 'username']]}},
        search: {in: ['query'], optional: true}
    }),
    formsController.getFormsByTemplate
)

router.get(
    '/admin/forms',
    roleMiddleware(Roles.Admin),
    checkSchema({
        page: {in: ['query'], isInt: true},
        limit: {in: ['query'], isInt: true},
        sort: {in: ['query'], optional: true, isIn: {options: [['asc', 'desc']]}},
        orderBy: {
            in: ['query'],
            optional: true,
            isIn: {options: [['title', 'username', 'email', 'createdAt']]}
        },
        searchBy: {in: ['query'], optional: true, isIn: {options: [['title', 'email', 'username']]}},
        search: {in: ['query'], optional: true}
    }),
    formsController.getForms
)


module.exports = router;
