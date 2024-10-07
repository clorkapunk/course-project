const ApiError = require("../exceptions/api-errors");
module.exports = function (...allowedRoles) {
    return (req, res, next) => {

        if (!req?.user?.roles) return next(ApiError.UnauthorizedError());
        const rolesArray = [...allowedRoles];
        const result = req.user.roles.map(role => rolesArray.includes(role)).find(val => val === true);
        if (!result) return next(ApiError.UnauthorizedError());
        next();
    }
}
