const Router = require('express').Router
const usersController = require('../controllers/users-controller')
const roleMiddleware = require('../middlewares/role-middleware')
const Roles = require("../config/roles");
const {body, checkSchema} = require('express-validator')

const router = new Router()


router.get(
    '/users-history',
    roleMiddleware(Roles.Admin),
    usersController.getHistory
)

router.get(
    '/users',
    roleMiddleware(Roles.Admin),
    checkSchema({
        page: {in: ['query'], optional: true, isInt: true},
        limit: {in: ['query'], optional: true, isInt: true},
        sort: {in: ['query'], optional: true, isIn: {options: [['asc', 'desc']]}},
        orderBy: {in: ['query'], optional: true, isIn: {options: [['email', 'id', 'role', 'isActive', 'username']]}},
        searchBy: {in: ['query'], optional: true, isIn: {options: [['email', 'username']]}},
        search: {in: ['query'], optional: true}
    }),
    usersController.getUsers
)
router.put(
    '/users/update-role',
    roleMiddleware(Roles.Admin),
    checkSchema({
        role: {notEmpty: true, isArray: false, isInt: true, isIn: {options: [Object.values(Roles)]}},
        ids: {notEmpty: true, isArray: true},
    }),
    usersController.updateUsersRole
)

router.put(
    '/users/update-status',
    roleMiddleware(Roles.Admin),
    checkSchema({
        status: {notEmpty: true, isArray: false, isBoolean: true},
        ids: {notEmpty: true, isArray: true},
    }),
    usersController.updateUsersStatus
)


module.exports = router;
