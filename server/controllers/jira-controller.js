const {checkValidationErrors} = require("../check-validation-errors");
const jiraService = require('../services/jira-service')


class JiraController {

    async createTicket(req, res, next) {
        try {
            const errors = checkValidationErrors(req, next)
            if(errors) return

            // const id = parseInt(req.body.id)
            const id = req.user.id
            const template = req.body.template
            const summary = req.body.summary
            const link = req.body.link
            const priority = req.body.priority

            const issue = await jiraService.createTicket({
                userId: id,
                templateTitle: template,
                summary,
                link,
                priority
            })

            res.json(issue)
        } catch (err) {
            next(err)
        }
    }

    async getUserTickets(req, res, next){
        try {
            const errors = checkValidationErrors(req, next)
            if(errors) return

            const id = parseInt(req.params.id)
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const {totalCount, tickets} = await jiraService.getByUserId({userId: id, page, limit})

            res.json({
                pages: Math.ceil(totalCount / limit),
                page,
                limit,
                total: totalCount,
                data: tickets
            })
        }catch (err){
            next(err)
        }
    }

    async deleteTicket(req,res, next){
        try {
            const errors = checkValidationErrors(req, next)
            if(errors) return

            const id = req.params.id

            const result = await jiraService.deleteTicket(id)

            res.json(`Ticket with id ${id} was deleted`)
        }catch (err){
            next(err)
        }

    }

    async deleteTickets(req, res, next){
        try {
            const errors = checkValidationErrors(req, next)
            if(errors) return

            const ids = req.body.ids

            const result = await jiraService.deleteTickets(ids)

            res.json(`Tickets deleted`)
        }catch (err){
            next(err)
        }
    }
}

module.exports = new JiraController();
