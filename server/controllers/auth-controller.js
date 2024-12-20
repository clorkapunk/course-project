const {validationResult} = require('express-validator')
const ApiError = require("../exceptions/api-errors");
const authService = require("../services/auth-service");
const {OAuth2Client} = require("google-auth-library");
const {checkSchema} = require("express-validator");
const {checkValidationErrors} = require("../check-validation-errors");


class AuthController {
    async registration(req, res, next) {
        try {
            const error = checkValidationErrors(req, next);
            if (error) return;

            const {username, email, password} = req.body

            const tokens = await authService.registration(email, password, username);
            authService.setCookie(res, 'refreshToken', tokens.refreshToken)
            return res.json({
                accessToken: tokens.accessToken
            });

        } catch (err) {
            next(err)
        }
    }

    async login(req, res, next) {
        try {
            const error = checkValidationErrors(req, next);
            if (error) return;

            const {email, password} = req.body

            const tokens = await authService.login(email, password);
            authService.setCookie(res, 'refreshToken', tokens.refreshToken)
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
            authService.clearCookie(res, 'refreshToken')
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
            authService.setCookie(res, 'refreshToken', tokens.refreshToken)
            return res.json({
                accessToken: tokens.accessToken
            });
        } catch (err) {
            next(err)
        }
    }
}

module.exports = new AuthController();
