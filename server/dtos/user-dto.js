module.exports = class UserDto {
    username;
    email;
    id;
    isActivated;
    roles;

    constructor(model) {
        this.email = model.email;
        this.id = model.id;
        this.username = model.username;
        this.isActivated = model.isActivated;
        this.roles = model.roles;
    }
}
