class UserApp {
    constructor(name, email, id, room, admin) {
        this.name = name
        this.email = email
        this.id = id
        this.room = room
        this.admin = admin
    }
}

module.exports = {
    UserApp: UserApp
}
