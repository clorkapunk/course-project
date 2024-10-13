module.exports = class UserDto {
    username;
    email;
    id;
    isActive;
    role;

    constructor(model) {
        this.email = model.email;
        this.id = model.id;
        this.username = model.username;
        this.isActive = model.isActive;
        this.role = model.role;
    }
}
