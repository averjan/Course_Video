class Message {
    constructor(msg, user) {
        this.item = document.querySelector('#message-item').content.cloneNode(true)
        this.item.querySelector('p').innerHTML = msg
        let d = new Date()
        this.item.querySelector('.time-right').innerHTML =
            String(d.getHours()).padStart(2, '0') +
            ':' +
            String(d.getUTCMinutes()).padStart(2, '0')
    }
}

module.exports = {
    Message: Message
}
