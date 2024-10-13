module.exports = Object.freeze({
    Unauthorized: "user_not_authorized",
    AccessDenied: "access_denied",
    UserAlreadyExist: "user_already_exist",
    UserNotExist: "user_not_exist",
    UserRegisteredViaExternalService: "user_registered_via_external_service",
    WrongPassword: "wrong_password",
    IncorrectVerificationLink: "incorrect_verification_link",
    ValidationFailed: {
        password: "validation_failed_password",
        email: "validation_failed_email",
        username: "validation_failed_username"
    }
});
