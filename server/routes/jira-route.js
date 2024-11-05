const Router = require('express').Router
const jiraController = require('../controllers/jira-controller')
const {checkSchema} = require("express-validator");

const router = new Router()

router.post(
    '/jira',
    checkSchema({
        // id: {notEmpty: true, isInt: true},
        summary: {in: ['body'],notEmpty: true, isString: true},
        link: {in: ['body'],notEmpty: true, isString: true},
        priority: {in: ['body'], notEmpty: true, isIn: {options: [["High", 'Average', "Low"]]}},
        template: {in: ['body'],optional: true, isString: true},
    }),
    jiraController.createTicket
)

router.get(
    '/jira/:id',
    checkSchema({
        id: {in: ['params'], notEmpty: true, isInt: true},
        page: {in: ['query'], notEmpty: true, isInt: true},
        limit: {in: ['query'], notEmpty: true, isInt: true},
        orderBy: {in: ['query'], optional: true, isIn: {options: [['created', 'priority', 'status']]}},
        sort: {in: ['query'], optional: true, isIn: {options: [['asc', 'desc']]}},
    }),
    jiraController.getUserTickets
)

router.delete(
    '/jira/:id',
    checkSchema({
        id: {in: ['params'], notEmpty: true, isInt: true}
    }),
    jiraController.deleteTicket
)

router.delete(
    '/jira',
    checkSchema({
        ids: {notEmpty: true, isArray: true}
    }),
    jiraController.deleteTickets
)


module.exports = router;
