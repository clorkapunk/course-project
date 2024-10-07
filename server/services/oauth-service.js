const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('../services/main-service')
const tokenService = require('../services/token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-errors')
const {prisma} = require("../prisma/prisma-client");
const {OAuth2Client} = require('google-auth-library')

class OAuthService {

    async generateGoogleAuthLink(){
        // const redirectUrl = `http://127.0.0.1:5173/oauth`
        // const redirectUrl = `${process.env.CLIENT_URL}/login`
        const redirectUrl = `${process.env.CLIENT_URL}/oauth`

        console.log('redirectUrl', redirectUrl)

        const oAuth2Client = new OAuth2Client(
            process.env.OAUTH_CLIENT_ID,
            process.env.OAUTH_CLIENT_SECRET,
            redirectUrl
        );

        const authorizeUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
            prompt: 'consent'
        });



        return authorizeUrl
    }

    async getGoogleUserData(access_token){
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`)
        const data = await response.json()

        return {
            email: data.email,
            username: data.name,
            isActivated: data.email_verified
        }
    }

}

module.exports = new OAuthService();
