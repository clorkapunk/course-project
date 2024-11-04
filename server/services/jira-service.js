const usersService = require('./users-service')
const axios = require('axios');
const ApiError = require("../exceptions/api-errors");
const ErrorCodes = require("../config/error-codes");



const auth = {
    username: process.env.JIRA_USERNAME,
    password: process.env.JIRA_TOKEN
}


class JiraService {
    async findUserByEmail(accountId) {
        const response = await axios.get(`${process.env.JIRA_BASE_URL}/rest/api/3/user?accountId=${accountId}`, {
            auth,
            headers: {
                'Accept': 'application/json'
            }
        });

        return response.data || null;
    }

    async createUser(id, email) {
        const response = await axios.post(
            'https://nemoy.atlassian.net/rest/api/3/user',
            {
                emailAddress: email,
                products: ["jira-servicedesk"]
            },
            {
                auth,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )

        if (response.data) {
            usersService.addJiraAccountId(id, response.data.accountId)
        }

        return response.data;
    }

    async createTicket({userId, templateTitle, summary, link, priority}) {

        let user = await usersService.getById(userId)

        let reporter;
        if (!user?.jiraAccountId) {
            reporter = await this.createUser(user.id, user.email);
        } else {
            reporter = await this.findUserByEmail(user.jiraAccountId);
        }

        if (!reporter) {
            throw ApiError.BadRequest(
                "Jira user not exist and failed to create",
                ErrorCodes.UserNotExist
            )
        }

        try {
            const response = await axios.post(
                `${process.env.JIRA_BASE_URL}/rest/api/3/issue`,
                {
                    fields: {
                        project: { key: process.env.JIRA_PROJECT_KEY },
                        issuetype: { id: '10004' }, // ID типа задачи, например, Complaint
                        summary: summary,
                        reporter: { id: reporter.accountId }, // Указываем автора задачи
                        customfield_10048: { id: reporter.accountId }, // Ваше кастомное поле для пользователя
                        customfield_10049: templateTitle || '', // Поле для заголовка шаблона
                        customfield_10052: link, // Поле для ссылки
                        priority: { name: priority}
                        // customfield_10051: { value: priority } // Поле для приоритета
                    }
                },
                {
                    auth,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data
        }
        catch (err){
            console.log(err.response.data)
        }


    }

    async getByUserId({userId, page, limit}){
        const user = await usersService.getById(userId)

        console.log(user)

        if(!user.jiraAccountId) {
            throw ApiError.BadRequest(
                "Jira user not exist",
                ErrorCodes.UserNotExist
            )
        }

        const jqlQuery = `reporter=${user.jiraAccountId}`;
        const response = await axios.get(`${process.env.JIRA_BASE_URL}/rest/api/3/search`, {
            auth,
            headers: {
                'Accept': 'application/json'
            },
            params: {
                jql: jqlQuery,
                startAt: (page - 1) * limit,
                maxResults: limit
            }
        });

        return {
            totalCount: response.data.total,
            tickets: response.data.issues.map(i => this.formatTicketFromJira(i))
        }
    }

    async deleteTicket(issueId){
        const response = await axios.delete(`${process.env.JIRA_BASE_URL}/rest/api/3/issue/${issueId}`, {
            auth,
            headers: {
                'Accept': 'application/json'
            }
        });

        return response.data
    }

    async deleteTickets(ids){
        const deleteRequests = ids.map(issueId =>
            axios.delete(`${process.env.JIRA_BASE_URL}/rest/api/3/issue/${issueId}`, {
                auth,
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(() => console.log(`Issue ${issueId} deleted successfully.`))
                .catch(error => console.error(`Failed to delete issue ${issueId}:`, error.response ? error.response.data : error.message))
        );

        return await Promise.all(deleteRequests);
    }

    formatTicketFromJira(ticket){
        return {
            id: ticket.id,
            key: ticket.key,
            url: ticket.fields.customfield_10010._links.web,
            fields: {
                summary: ticket.fields.summary,
                reportedBy: {
                    accountId: ticket.fields.customfield_10048.accountId,
                    displayName: ticket.fields.customfield_10048.displayName,
                    active: ticket.fields.customfield_10048.active
                },
                templateTitle: ticket.fields.customfield_10049,
                link: ticket.fields.customfield_10052,
                priority: {
                    iconUrl: ticket.fields.priority.iconUrl,
                    name: ticket.fields.priority.name
                },
                status: {
                    key: ticket.fields.status.statusCategory.key,
                    updatedAt: ticket.fields.statuscategorychangedate
                }
            },
            createdAt: ticket.fields.created
        }
        return ticket
    }
}

module.exports = new JiraService();
