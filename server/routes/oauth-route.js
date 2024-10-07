const Router = require('express').Router
const oAuthController = require('../controllers/oauth-controller')

const router = new Router()

router.post('/', oAuthController.googleAuthRequest)
router.get('/', oAuthController.googleAuthCallback)


module.exports = router;
