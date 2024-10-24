const Router = require('express').Router
const templatesController = require('../controllers/templates-controller')
const roleMiddleware = require('../middlewares/role-middleware')
const Roles = require("../config/roles");
const {body, checkSchema} = require('express-validator')
const multer = require('multer')
const {join} = require("node:path");
const authMiddleware = require('../middlewares/auth-middleware')


const multerMiddleware = multer({
    storage: multer.memoryStorage()
})

const router = new Router()


router.get(
    '/templates',
    checkSchema({
        tags: {in: ['query'], optional: true, custom: {
                options: (value) => {
                    const items = value.split(',');
                    const allNumbers = items.every(item => !isNaN(Number(item)));
                    if (!allNumbers) {
                        throw new Error('All tags items must be numbers');
                    }
                    return true;
                }
            }},
        page: {in: ['query'], optional: true, isInt: true},
        limit: {in: ['query'], optional: true, isInt: true},
        search: {in: ['query'], optional: true},
        type: {in: ['query'], optional: true, isIn: {options: [['latest', 'popular', 'search', 'tags']]}},
    }),
    templatesController.getTemplates
)

router.get('/templates/:id',
    checkSchema({
        id: {in: ['params'], isInt: true}
    }),
    templatesController.getTemplate
)

router.get('/templates/user/:id',
    checkSchema({
        id: {in: ['params'], isInt: true},
        page: {in: ['query'], isInt: true},
        limit: {in: ['query'], isInt: true},
        sort: {in: ['query'], optional: true, isIn: {options: [['asc', 'desc']]}},
        orderBy: {
            in: ['query'],
            optional: true,
            isIn: {options: [['title', 'description', 'mode', 'form', 'createdAt']]}
        },
        searchBy: {in: ['query'], optional: true, isIn: {options: [['title', 'description']]}},
        search: {in: ['query'], optional: true}
    }),
    templatesController.getUserTemplates
)

router.get(
    '/topics',
    templatesController.getTopics
)

router.get(
    '/tags',
    checkSchema({
        exclude: {in: ['query'], optional: true, custom: {
                options: (value) => {
                    const items = value.split(',');
                    const allNumbers = items.every(item => !isNaN(Number(item)));
                    if (!allNumbers) {
                        throw new Error('All exclude items must be numbers');
                    }
                    return true;
                }
            }},
        type: {in: ['params'], optional: true, isIn: {options: [['popular']]}},
        page: {in: ['query'], optional: true, isInt: true},
        limit: {in: ['query'], optional: true, isInt: true},
        search: {in: ['query'], optional: true}
    }),
    templatesController.getTags
)

router.post(
    '/templates',
    authMiddleware,
    multerMiddleware.single("file"),
    checkSchema({
        file: {optional: true},
        title: {notEmpty: true, isString: true},
        description: {notEmpty: true, isString: true},
        topicId: {notEmpty: true, isInt: true},
        mode: {notEmpty: true, isString: true, isIn: {options: [['public', 'private']]}},
        questions: {notEmpty: true},
        tags: {notEmpty: true},
        allowedUsers: {optional: true}
    }),
    templatesController.createTemplate
)

router.delete(
    '/templates',
    authMiddleware,
    checkSchema({
        templatesIds: {notEmpty: true, isArray: true}
    }),
    templatesController.deleteTemplates
)

router.patch(
    '/templates/:id',
    authMiddleware,
    multerMiddleware.single("file"),
    checkSchema({
        id: {in: ['params'], notEmpty: true, isInt: true},
        file: {optional: true},
        title: {optional: true, isString: true},
        description: {optional: true, isString: true},
        topicId: {optional: true, isInt: true},
        mode: {optional: true, isString: true, isIn: {options: [['public', 'private']]}},
        questions: {optional: true},
        tags: {optional: true}
    }),
    templatesController.updateTemplate
)


module.exports = router;
