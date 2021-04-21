class Message {
    constructor(msg, user) {
        this.item = document.querySelector('#message-item').content.cloneNode(true)
        this.item.querySelector('p').innerHTML = msg
        let d = new Date()
        this.item.querySelector('.time').innerHTML =
            String(d.getHours()).padStart(2, '0') +
            ':' +
            String(d.getUTCMinutes()).padStart(2, '0')

        this.item.querySelector('.username-left').innerHTML = user.name
    }

    time() {
        return this.item.querySelector('.time')
    }

    username() {
        return this.item.querySelector('.username')
    }

    message() {
        return this.item.querySelector('li')
    }
}

module.exports = {
    Message: Message
}
