// Сообщение в чате
class Message {
    /**
     * Отправляет письмо на почту.
     * @constructor
     * @param {string} msg - Сообщение.
     * @param {UserApp} user - Объект отправчителя.
     */
    constructor(msg, user) {
        // Получение шаблона сообщения
        this.item = document.querySelector('#message-item').content.cloneNode(true)
        this.item.querySelector('p').innerHTML = msg

        // Установка даты сообщения
        let d = new Date()
        this.item.querySelector('.time').innerHTML =
            String(d.getHours()).padStart(2, '0') +
            ':' +
            String(d.getUTCMinutes()).padStart(2, '0')

        this.item.querySelector('.username-left').innerHTML = user.name
    }

    /**
     * Возврещает время отправления сообщния.
     * @function
     * @return {HTMLElementTagNameMap}
     */
    time() {
        return this.item.querySelector('.time')
    }

    /**
     * Возвращет имя отправителя.
     * @function
     * @return {HTMLElementTagNameMap}
     */
    username() {
        return this.item.querySelector('.username')
    }

    /**
     * Возвращает сообщение.
     * @function
     * @return {HTMLElementTagNameMap}
     */
    message() {
        return this.item.querySelector('li')
    }
}

module.exports = {
    Message: Message
}
