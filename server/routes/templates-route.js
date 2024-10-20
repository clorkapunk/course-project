const Router = require('express').Router
const templatesController = require('../controllers/templates-controller')
const roleMiddleware = require('../middlewares/role-middleware')
const Roles = require("../config/roles");
const {body, checkSchema} = require('express-validator')
const multer = require('multer')
const {join} = require("node:path");
const authMiddleware = require('../middlewares/auth-middleware')

const multerMiddleware = multer({
    storage: multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, join(__dirname, '../', 'uploads'));
        },
        filename: function (req, file, callback) {
            callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024,
    }
});

const router = new Router()


router.get(
    '/templates',
    checkSchema({
        page: {in: ['query'], optional: true, isInt: true},
        limit: {in: ['query'], optional: true, isInt: true},
        search: {in: ['query'], optional: true},
        type: {in: ['query'], optional: true, isIn: {options: [['latest', 'popular', 'search']]}},
    }),
    templatesController.getTemplates
)

router.get('/templates/:id',
    checkSchema({
        id: {in: ['params'], isInt: true}
    }),
    templatesController.getTemplate
    )

router.get(
    '/topics',
    templatesController.getTopics
)

router.get(
    '/tags',
    checkSchema({
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
        mode: {notEmpty: true, isString: true, isIn: {options: [['public','private']]}},
        questions: {notEmpty: true},
        tags: {notEmpty: true}
    }),
    templatesController.createTemplate
)


module.exports = router;