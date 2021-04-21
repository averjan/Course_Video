// const socket = io('http://localhost:4000');
const md5 = require('../node_modules/md5/md5.js')
const { Message } = require('../js/message')
const { FileMessage } = require('../js/file_message')

let messages = document.getElementById('messages')
let form = document.getElementById("form")
let input = document.getElementById("input")

form.addEventListener('submit', function (e) {
    e.preventDefault()
    if (input.value) {
        socket.emit('chat message', input.value, activeUser)
        input.value = ''
    }
})

socket.on('chat message', function(msg, user) {
    let item = document.createElement('li')
    let chat = document.getElementById('chat-div')
    let m = new Message(msg, user)
    if (user.id == activeUser.id) {
        m.time().className = 'time time-left'
        m.username().className = 'username username-right'
        m.message().className += ' darker'
    }

    messages.appendChild(m.item)
    chat.scrollTop = chat.scrollHeight
    //window.scrollTo(0, document.body.scrollHeight)
})

function appendFileToChat(file) {
    let filePath = file.file.path
    let fileContainerID = md5(filePath)
    filePathMap[fileContainerID] = filePath

    let item = new FileMessage(file.file, file.user, fileContainerID)
    if (file.user.id === activeUser.id) {
        item.makeDark()
    }
    /*
    let item = document.createElement('li')
    let fileReference = document.createElement('a')
    //fileReference.appendChild(document.createTextNode(file.file.name))
    fileReference.textContent = file.file.name
    fileReference.id = fileContainerID
    fileReference.addEventListener('click', (e) => {
        e.preventDefault()
        downloadFile(e.target, e.target.id)
    })
    item.appendChild(fileReference)
    */
    messages.appendChild(item.item)
}

function downloadFile(file, id) {
    callToDownload(file, id)
}
