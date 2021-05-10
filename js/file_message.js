// Сообщение с файлом в чате
class FileMessage {
    constructor(file, user, fileID) {
        this.item = document.querySelector('#message-file-item').content.cloneNode(true)

        this.item.querySelector('p').id = fileID

        // Установка события скачивания файла
        this.item.querySelector('p').addEventListener('click', (e) => {
            e.preventDefault()
            downloadFile(e.target, e.target.id)
        })

        this.item.querySelector('p').style.cursor = 'pointer'
        this.item.querySelector('p').innerHTML = file.name

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

    /**
     * Добавляет стили DOM элементу сообщения, означающие принадлежность сообщения самому пользователю.
     * @function
     * @return {HTMLElementTagNameMap}
     */
    makeDark() {
        this.time().className = 'time time-left'
        this.username().className = 'username username-right'
        this.message().className += ' darker'
    }
}

module.exports = {
    FileMessage: FileMessage
}
