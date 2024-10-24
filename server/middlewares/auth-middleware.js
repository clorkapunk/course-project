const ApiError = require('../exceptions/api-errors');
const tokenService = require('../services/token-service')
const {prisma} = require("../prisma/prisma-client");

module.exports = function (req, res, next) {
    try{
        const authorizationHeader = req.headers.authorization;
        if(!authorizationHeader){
            return next(ApiError.UnauthorizedError())
        }

        const accessToken = authorizationHeader.split(' ')[1];

        if(!accessToken){
            return next(ApiError.UnauthorizedError())
        }

        const userData = tokenService.validateAccessToken(accessToken)

        if(!userData) {
            return next(ApiError.ForbiddenError())
        }

        req.user = userData
        next()
    }
    catch (err){
        return next(ApiError.UnauthorizedError())
    }

}
