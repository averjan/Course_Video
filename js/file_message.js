class FileMessage {
    constructor(file, user, fileID) {
        this.item = document.querySelector('#message-file-item').content.cloneNode(true)

        this.item.querySelector('p').id = fileID
        //this.item.querySelector('div').id = fileID
        this.item.querySelector('p').addEventListener('click', (e) => {
            e.preventDefault()
            downloadFile(e.target, e.target.id)
        })

        this.item.querySelector('p').style.cursor = 'pointer'
        this.item.querySelector('p').innerHTML = file.name
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

    makeDark() {
        this.time().className = 'time time-left'
        this.username().className = 'username username-right'
        this.message().className += ' darker'
    }
}

module.exports = {
    FileMessage: FileMessage
}
