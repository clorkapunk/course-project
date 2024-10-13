const ErrorCodes = require('../config/error-codes')

module.exports = class ApiErrors extends Error {
    code;
    status;
    errors;

    constructor(status, message, code, errors = []) {
        super(message);
        this.code = code
        this.status = status;
        this.errors = errors;
    }

    static ForbiddenError(){
        return new ApiErrors(403, 'Access denied', ErrorCodes.AccessDenied);
    }

    static UnauthorizedError() {
        return new ApiErrors(401, 'User is not authorized', ErrorCodes.Unauthorized);
    }

    static BadRequest(message, code, errors = []) {
        return new ApiErrors(400, message, code, errors);
    }
}
