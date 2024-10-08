const {validationResult} = require('express-validator')
const ApiError = require("../exceptions/api-errors");
const authService = require("../services/auth-service");
const {OAuth2Client} = require("google-auth-library");


class AuthController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req)
            const {username, email, password} = req.body

            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Validation failed.", errors.array()))
            }

            const tokens = await authService.registration(email, password, username);
            res.cookie('refreshToken', tokens.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: process.env.COOKIE_HTTP_ONLY,
                secure: process.env.COOKIE_SECURE,
                sameSite: process.env.COOKIE_SAME_SITE
            })
            return res.json({
                accessToken: tokens.accessToken
            });
        } catch (err) {
            next(err)
        }
    }

    async login(req, res, next) {


        try {
            const errors = validationResult(req)
            const {email, password} = req.body

            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Validation failed.", errors.array()))
            }

            const tokens = await authService.login(email, password);
            res.cookie('refreshToken', tokens.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: process.env.COOKIE_HTTP_ONLY,
                secure: process.env.COOKIE_SECURE,
                sameSite: process.env.COOKIE_SAME_SITE
            })

            return res.json({
                accessToken: tokens.accessToken
            });
        } catch (err) {
            next(err)
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies
            const token = await authService.logout(refreshToken)
            res.clearCookie('refreshToken')
            res.clearCookie('google_id_token')
            res.clearCookie('google_refresh_token')
            return res.json({token})
        } catch (err) {
            next(err)
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link
            await authService.activate(activationLink)
            return res.redirect(process.env.CLIENT_URL)
        } catch (err) {
            next(err)
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies
            const tokens = await authService.refresh(refreshToken)
            res.cookie('refreshToken', tokens.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: process.env.COOKIE_HTTP_ONLY,
                secure: process.env.COOKIE_SECURE,
                sameSite: process.env.COOKIE_SAME_SITE
            })
            return res.json({
                accessToken: tokens.accessToken
            });
        } catch (err) {
            next(err)
        }
    }
}

module.exports = new AuthController();
