const ApiError = require('../exceptions/api-errors');
const tokenService = require('../services/token-service')
const usersService = require('../services/users-service')
const ErrorCodes = require("../config/error-codes");

module.exports = async function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return next(ApiError.UnauthorizedError())
        }

        const accessToken = authorizationHeader.split(' ')[1];

        if (!accessToken) {
            return next(ApiError.UnauthorizedError())
        }

        const userData = tokenService.validateAccessToken(accessToken)

        if (!userData) {
            return next(ApiError.ForbiddenError())
        }

        const user = await usersService.validateUserData(userData)

        if(!user.isActive){
            return next(ApiError.Banned())
        }

        req.user = user
        next()
    } catch (err) {
        return next(ApiError.UnauthorizedError())
    }

}
