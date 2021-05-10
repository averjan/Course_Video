// Класс пользователя конференции
class UserApp {
    /**
     * Создает новый объект пользователя конференции
     * @constructor
     * @param {string} to - Почта клиента.
     * @param {string} userName - Имя клиента в конференции.
     * @param {string} masterName - имя создателя конференции.
     */
    constructor(name, email, id, room, admin) {
        this.name = name
        this.email = email
        this.id = id
        this.room = room
        this.admin = admin
    }
}

// Экспорт класса
module.exports = {
    UserApp: UserApp
}
