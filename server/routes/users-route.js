const Router = require('express').Router
const userController = require('../controllers/auth-controller')
const roleMiddleware = require('../middlewares/role-middleware')

const router = new Router()

// router.get('/users', roleMiddleware('ADMIN'), userController.getUsers)

module.exports = router;
