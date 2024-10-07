const Router = require('express').Router
const authController = require('../controllers/auth-controller')
const {body} = require('express-validator')

const router = new Router()

router.post('/sign-up',
    body('username').not().isEmpty(),
    body('email').isEmail(),
    body('password').isLength({min: 3}),
    authController.registration
)
router.post('/login',
    body('email').isEmail(),
    body('password').not().isEmpty(),
    authController.login
)
router.get('/logout', authController.logout)
router.get('/activate/:link', authController.activate)
router.get('/refresh', authController.refresh)


module.exports = router;
