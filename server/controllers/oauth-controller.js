const {validationResult} = require('express-validator')
const ApiError = require("../exceptions/api-errors");
const oAuthService = require("../services/oauth-service");
const {OAuth2Client} = require("google-auth-library");
const {prisma} = require("../prisma/prisma-client");
const UserDto = require("../dtos/user-dto");
const tokenService = require("../services/token-service");


class OAuthController {
    async googleAuthRequest(req, res, next) {
        try {
            res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL);
            res.header("Access-Control-Allow-Credentials", 'true');
            res.header('Referrer-Policy', 'no-referrer-when-downgrade');
            const authorizeUrl = await oAuthService.generateGoogleAuthLink()
            return res.json({url: authorizeUrl})
        } catch (err) {
            console.log(err)
        }
    }

    async googleAuthCallback(req, res, next) {
        try{
            const code = req.query.code
            const redirectUrl = `${process.env.CLIENT_URL}/oauth`
            const oAuth2Client = new OAuth2Client(
                process.env.OAUTH_CLIENT_ID,
                process.env.OAUTH_CLIENT_SECRET,
                redirectUrl
            );
            const response = await oAuth2Client.getToken(code)
            await oAuth2Client.setCredentials(response.tokens)
            const userCredentials = oAuth2Client.credentials
            const userData = await oAuthService.getGoogleUserData(userCredentials.access_token)


            let user = await prisma.user.findFirst({where: {email: userData.email}})

            if(!user){
                user = await prisma.user.create({
                    data: {
                        email: userData.email,
                        isActivated: userData.isActivated,
                        username: userData.username,
                    }
                })
            }


            const userDto = new UserDto(user)
            const tokens = tokenService.generateTokens({...userDto})
            await tokenService.saveToken(userDto.id, tokens.refreshToken)

            res.cookie('refreshToken',
                tokens.refreshToken,
                {
                    maxAge: 60 * 60 * 1000,
                    httpOnly: true,
                    secure: true,
                    sameSite: false
                })
            res.cookie('google_refresh_token',
                response.tokens.refresh_token,
                {
                    maxAge: 60 * 60 * 1000,
                    httpOnly: true,
                    secure: true,
                    sameSite: false
                })
            res.cookie('google_id_token',
                response.tokens.id_token,
                {
                    maxAge: 60 * 60 * 1000,
                    httpOnly: true,
                    secure: true,
                    sameSite: false
                })

            return res.json({
                accessToken: tokens.accessToken
            });
            // return res.redirect(303, `${process.env.CLIENT_URL}`)
        }
        catch (err){
            console.log('Error when sign in with Google', err)

        }
    }
}

module.exports = new OAuthController();
