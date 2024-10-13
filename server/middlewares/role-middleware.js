const ApiError = require("../exceptions/api-errors");
module.exports = function (...allowedRoles) {
    return (req, res, next) => {
        if (!req?.user?.role) return next(ApiError.UnauthorizedError());
        const rolesArray = [...allowedRoles];
        const result =  rolesArray.some(role => role === req.user.role);
        if (!result) return next(ApiError.UnauthorizedError());
        next();
    }
}
