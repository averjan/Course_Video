// const socket = io('http://localhost:4000');
const md5 = require('../node_modules/md5/md5.js')

let messages = document.getElementById('messages')
let form = document.getElementById("form")
let input = document.getElementById("input")

form.addEventListener('submit', function (e) {
    e.preventDefault()
    if (input.value) {
        socket.emit('chat message', input.value, roomID)
        input.value = ''
    }
})

socket.on('chat message', function(msg) {
    let item = document.createElement('li')
    item.textContent = msg
    messages.appendChild(item)
    window.scrollTo(0, document.body.scrollHeight)
})

function appendFileToChat(file) {
    let filePath = file.file.path
    let fileContainerID = md5(filePath)
    filePathMap[fileContainerID] = filePath

    let item = document.createElement('li')
    let fileReference = document.createElement('a')
    fileReference.appendChild(document.createTextNode(file.file.name))
    fileReference.id = fileContainerID
    fileReference.addEventListener('click', (e) => {
        e.preventDefault()
        downloadFile(e.target, e.target.id)
    })
    item.appendChild(fileReference)
    messages.appendChild(item)
}

function downloadFile(file, id) {
    callToDownload(file, id)
}
