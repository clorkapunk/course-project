const Router = require('express').Router
const authController = require('../controllers/auth-controller')
const {body, checkSchema} = require('express-validator')

const router = new Router()

router.post('/sign-up',
    checkSchema({
        username: {notEmpty: true},
        email: {isEmail: true},
        password: {notEmpty: true, isLength: {options: {min: 3}}},
    }),
    authController.registration
)
router.post(
    '/login',
    checkSchema({
        email: {isEmail: true},
        password: {notEmpty: true},
    }),
    authController.login
)
router.get('/logout', authController.logout)
router.get('/activate/:link', authController.activate)
router.get('/refresh', authController.refresh)


module.exports = router;
