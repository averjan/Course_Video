const md5 = require('../node_modules/md5/md5.js')
const { Message } = require('../js/message')
const { FileMessage } = require('../js/file_message')

// DOM элемент, содержащий все сообщения в чате
let messages = document.getElementById('messages')

// DOM форма, подтверждающая отправку сообщения
let form = document.getElementById("form")

// DOM элемент с текстом сообщения
let input = document.getElementById("input")

// Событие нажатия кнопки отправки сообщения в чат
form.addEventListener('submit', function (e) {
    e.preventDefault()
    if (input.value) {
        socket.emit('chat message', input.value, activeUser)
        input.value = ''
    }
})

// Установка обработчика на сокет событие получения сообщения в чат
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
})

/**
 * Добавляет сообщение с файлом в чат.
 * @function
 * @param {Object} file - Информация о файле.
 */
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

/**
 * Отправка запроса на получение файла с сервера.
 * @function
 * @param {HTMLElement} file - HTML элемент файла в чате.
 * @param {string} id - id файла на сервере.
 */
function downloadFile(file, id) {
    callToDownload(file, id)
}
