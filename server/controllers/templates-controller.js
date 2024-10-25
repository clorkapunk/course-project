const {validationResult} = require('express-validator')
const ApiError = require("../exceptions/api-errors");
const templatesService = require("../services/templates-service");
const googleDriveService = require("../services/google-drive-service");
const commentsService = require("../services/comments-service")
const likesService = require("../services/likes-service")
const topicsService = require("../services/topics-service")
const tagsService = require("../services/tags-service")
const {unlink} = require("node:fs");
const {log} = require("debug");
const {prisma} = require("../prisma/prisma-client");
const {checkValidationErrors} = require("../check-validation-errors");
const Roles = require('../config/roles')
const tokenService = require("../services/token-service");

class TemplatesController {

    async getTemplates(req, res, next) {
        try {
            checkValidationErrors(req, next)

            const limit = parseInt(req.query.limit) || 8;
            const search = req.query.search || ""
            const type = req.query.type || 'latest'
            const page = parseInt(req.query.page) || 1;
            let tags = []


            if(req.query.tags){
                tags = req.query.tags.split(',')
                tags = tags.filter(i => i.trim() !== '').map(i => parseInt(i))
            }



            const toDate = new Date()
            toDate.setDate(toDate.getDate() - 4)

            let result;

            if (type === 'latest') {
                result = await templatesService.getLatest({
                    take: limit,
                    skip: (page - 1) * limit,
                    toDate
                });
            }
            else if (type === 'popular') {
                result = await templatesService.getPopular({
                    take: limit,
                    skip: (page - 1) * limit
                })
            }
            else if(type === 'search') {
                result = await templatesService.getSearched({
                    take: limit,
                    skip: (page - 1) * limit,
                    search,
                    tags
                })
            }
            else if(type === 'tags'){
                result = await templatesService.getByTags({
                    take: limit,
                    skip: (page - 1) * limit,
                    tags
                })
            }
            // else if(type === 'admin'){
            //     result = await templatesService.get({
            //         take: limit,
            //         skip: (page - 1) * limit,
            //         search
            //     })
            // }

            return res.json({
                page,
                limit,
                pages: Math.ceil(result.totalCount / limit),
                total: result.totalCount,
                data: result.templates
            })
        } catch (err) {
            next(err)
        }
    }

    async getTemplate(req, res, next){
        try{
            checkValidationErrors(req, next)

            let userId = undefined
            if(req.headers.authorization){
                const authorizationHeader = req.headers.authorization
                const accessToken = authorizationHeader.split(' ')[1];
                if(!accessToken){
                    return next(ApiError.UnauthorizedError())
                }
                const userData = tokenService.validateAccessToken(accessToken)
                if(!userData) {
                    return next(ApiError.ForbiddenError())
                }
                userId = userData.id
            }


            const id = parseInt(req.params.id) || 1

            const template = await templatesService.getById(id, userId)

            return res.json(template)

        }catch (err){
            next(err)
        }
    }

    async getAdminTemplates(req,res,next){
        try {
            checkValidationErrors(req, next)

            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const sort = req.query.sort || "desc"
            const orderField = req.query.orderBy || "id"
            const search = req.query.search || ""
            const searchField = req.query.searchBy || 'title'

            const {templates, totalCount} = await templatesService.get({
                take: limit,
                skip: (page - 1) * limit,
                search,
                sort,
                orderField,
                searchField
            })

            return res.json({
                page,
                limit,
                pages: Math.ceil(totalCount / limit),
                total: totalCount,
                data: templates
            })

        }catch (err){
            next(err)
        }
    }

    async getUserTemplates(req, res, next){
        try{
            checkValidationErrors(req, next)

            const id = parseInt(req.params.id) || 0
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const sort = req.query.sort || "desc"
            const orderField = req.query.orderBy || "id"
            const search = req.query.search || ""
            const searchField = req.query.searchBy || 'title'

            const {templates, totalCount} = await templatesService.getByUserId({
                userId: id,
                take: limit,
                skip: (page - 1) * limit,
                search,
                sort,
                orderField,
                searchField
            })

            return res.json({
                page,
                limit,
                pages: Math.ceil(totalCount / limit),
                total: totalCount,
                data: templates
            })
        }catch (err){
            next(err)
        }
    }

    async createTemplate(req, res, next) {
        try {
            checkValidationErrors(req, next)



            const {title, description, mode} = req.body
            const topicId = parseInt(req.body.topicId)
            const questions = JSON.parse(req.body.questions)
            const tags = JSON.parse(req.body.tags)
            let allowedUsers = []

            if(mode === 'private') {
                allowedUsers = JSON.parse(req.body.allowedUsers)
            }

            let image;
            if (!req.file) {
                image = null
            } else {
                image = await googleDriveService.uploadToGoogleDrive(req.file);
            }

            const template = await templatesService.create({
                title,
                description,
                topicId,
                image,
                mode,
                userId: req.user.id,
                questions,
                tags,
                allowedUsers
            })


            res.json({template})

        } catch (err) {
            next(err)
        }
    }

    async getTopics(req, res, next) {
        try {
            const topics = await topicsService.getAll();
            return res.json(topics)
        } catch (err) {
            next(err)
        }
    }

    async getTags(req, res, next) {
        try {
            checkValidationErrors(req, next)

            const page = parseInt(req.query.page) || 1
            const limit = parseInt(req.query.limit) || 5;
            const search = req.query.search || ""
            const type = req.query.type || "default"
            const exclude = req.query.exclude
                ? req.query.exclude.split(',').filter(i => i.trim() !== '').map(i => parseInt(i))
                : [];

            let result;

            if(type === 'popular'){
                result = await tagsService.getPopular({
                    take: limit
                });
            }
            else{
                result = await tagsService.get({
                    skip: (page - 1) * limit,
                    take: limit,
                    search,
                    exclude
                });
            }



            return res.json({
                data: result.tags,
                total: result.totalCount,
                pages: Math.ceil(result.totalCount / limit),
                page,
                limit
            })
        } catch (err) {
            next(err)
        }
    }

    async deleteTemplates(req, res, next){
        try {
            checkValidationErrors(req, next)

            const templatesIds = req.body.templatesIds
            const {id, role} = req.user

            let result
            if(role === Roles.Admin){
                result = await templatesService.deleteAll(templatesIds)
            }
            else{
                result = await templatesService.deleteAll(templatesIds, id)
            }

            return res.json(result)
        }catch (err){
            next(err)
        }
    }

    async updateTemplate(req,res,next){
        try {
            checkValidationErrors(req, next)
            let data = {
                ...req.body
            }

            const templateId = parseInt(req.params.id)
            const {id, role} = req.user

            let image;
            if (!req.file) {
                image = null
            } else {
                image = await googleDriveService.uploadToGoogleDrive(req.file);
                data = {
                    ...data,
                    image
                }
            }

            data = Object.fromEntries(
                Object.entries(data).filter(([key, value]) => value !== null)
            );


            data = {
                ...data,
                topicId: parseInt(data.topicId),
                questions: JSON.parse(data.questions),
                tags: JSON.parse(data.tags)
            }

            let result
            if(role === Roles.Admin){
                result = await templatesService.update(templateId, data)
            }
            else{
                result = await templatesService.update(templateId, data, id)
            }

            return res.json(result)

        }catch (err){
            next(err)
        }
    }

    async likeTemplate(req, res, next){
        try {
            checkValidationErrors(req, next)

            const templateId = parseInt(req.params.id)
            const userId = parseInt(req.user.id)

            const like = await likesService.create({
                templateId,
                userId
            })

            return res.json(like)
        }catch (err){
            next(err)
        }
    }

    async dislikeTemplate(req, res, next){
        try {
            checkValidationErrors(req, next)

            const id = parseInt(req.params.id)
            const userId = parseInt(req.user.id)

            const like = await likesService.delete({
                id,
                userId
            })

            return res.json(like)
        }catch (err){
            next(err)
        }
    }
}

const deleteFile = (filePath) => {
    unlink(filePath, () => {
        console.log("file deleted");
    });
};


module.exports = new TemplatesController();
