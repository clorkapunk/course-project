const ApiError = require("./exceptions/api-errors");
const {validationResult} = require("express-validator");

function checkValidationErrors(req, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const firstErrorCode = errors.array()[0].path
        return next(ApiError.BadRequest(
            "Validation failed",
            `validation_failed_${firstErrorCode}`,
            errors.array())
        )
    }
}

module.exports = {checkValidationErrors}
