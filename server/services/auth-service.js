const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('../services/main-service')
const tokenService = require('../services/token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-errors')
const {prisma} = require("../prisma/prisma-client");
const {OAuth2Client} = require('google-auth-library')

class AuthService {

    async registration(email, password, username) {
        const candidate = await prisma.user.findFirst({where: {email}})

        if (candidate) {
            throw ApiError.BadRequest(`User with email address ${email} already exists`)
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const activationLink = uuid.v4()
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                username,
                activationLink,
            }
        })

        const userDto = new UserDto(user)

        // todo send activation mail
        // await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens}
    }

    async activate(activationLink) {
        const user = await prisma.user.findFirst({where: {activationLink}})
        if (!user) {
            throw ApiError.BadRequest(`Incorrect activation link`)
        }

        await prisma.user.update({
            where: {id: user.id},
            data: {isActivated: true}
        })
    }

    async login(email, password) {
        const user = await prisma.user.findFirst({where: {email}})

        if (!user) {
            throw ApiError.BadRequest(`User with email address ${email} does not exist`)
        }

        if(!user.password){
            throw ApiError.BadRequest(`The account with the email address ${email} was created through authorization with Google or another external service. `)
        }

        const isPassEqual = await bcrypt.compare(password, user.password)

        if (!isPassEqual) {
            throw ApiError.BadRequest("Wrong password")
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

}

module.exports = new AuthService();
