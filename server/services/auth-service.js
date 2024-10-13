const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('../services/main-service')
const tokenService = require('../services/token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-errors')
const {prisma} = require("../prisma/prisma-client");
const {OAuth2Client} = require('google-auth-library')
const env = process.env.NODE_ENV || 'development';
const ErrorCodes = require('../config/error-codes')

const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24
};

if(env === 'production'){
    cookieOptions.secure = true
    cookieOptions.sameSite = 'none'
}

class AuthService {

    async registration(email, password, username, isVerified = false) {
        const candidate = await prisma.user.findFirst({where: {email}})

        if (candidate) {
            throw ApiError.BadRequest(
                `User with email address ${email} already exists`,
                ErrorCodes.UserAlreadyExist
            )
        }

        let hashedPassword = null
        let verificationLink = null
        if(password){
            const salt = await bcrypt.genSalt(10)
            hashedPassword = await bcrypt.hash(password, salt)

        }
        if(!isVerified){
            verificationLink = uuid.v4()
        }

        const user = await prisma.user.create({
            data: {
                email,
                isVerified,
                password: hashedPassword,
                username,
                verificationLink
            }
        })

        const userDto = new UserDto(user)

        // todo send activation mail
        // await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens}
    }

    async activate(verificationLink) {
        const user = await prisma.user.findFirst({where: {verificationLink}})
        if (!user) {
            throw ApiError.BadRequest(`Incorrect verification link`, ErrorCodes.IncorrectVerificationLink)
        }

        await prisma.user.update({
            where: {id: user.id},
            data: {isVerified: true}
        })
    }

    async login(email, password) {
        const user = await prisma.user.findFirst({where: {email}})

        if (!user) {
            throw ApiError.BadRequest(`User with email address ${email} does not exist`, ErrorCodes.UserNotExist)
        }

        if(!user.password){
            throw ApiError.BadRequest(
                `The account with the email address ${email} was created through authorization with Google or another external service.`,
                ErrorCodes.UserRegisteredViaExternalService
            )
        }

        const isPassEqual = await bcrypt.compare(password, user.password)

        if (!isPassEqual) {
            throw ApiError.BadRequest("Wrong password", ErrorCodes.WrongPassword)
        }

        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens}

    }

    async logout(refreshToken) {
        return await tokenService.removeToken(refreshToken);
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError()
        }

        const userData = tokenService.validateRefreshToken(refreshToken)
        const tokenFromDB = await tokenService.findToken(refreshToken)


        if (!userData || !tokenFromDB) {
            throw ApiError.UnauthorizedError()
        }

        const user = await prisma.user.findFirst({where: {id: userData.id}})
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens}
    }

    setCookie(res, name, value, options = {}) {
        res.cookie(name, value, { ...cookieOptions, ...options });
    }

    clearCookie(res, name, options = {}){
        const {maxAge, otherOptions} = cookieOptions
        res.clearCookie(name, {
            ...otherOptions,
            ...options,
            expires: new Date(0),
            path: '/',
            domain: process.env.API_URL
        })
    }

}

module.exports = new AuthService();
