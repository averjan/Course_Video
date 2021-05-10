////// File sharing
const { getCommandLine } = require('../utils')
const exec = require('child_process').exec
const path = require('path')

/**
 * Открытие файла из чата.
 * @function
 * @param {HTMLElement} e - DOM эелемент сообщения с файлом.
 */
function openFile(e) {
    let fileName = e.parentElement.getElementsByClassName('file-name')[0].textContent
    let filePath = path.resolve('./tmp/' + fileName)
    exec(getCommandLine() + ' ' + filePath)
}

/**
 * Старт загрузки файла а сервер.
 * @function
 * @param {File} file - Выбранный для загрузки файл.
 */
const shareFile = (file) => {
    if (file){
        uploading = true
        fileReader = new FileReader()
        let slice = file.slice(0, 100000)
        tempFile = file
        tempFileName = md5(file.name + new Date())
        sendFileSlice(0, slice)

    }
}

/**
 * Отправляет блок файла на сервер.
 * @function
 * @param {Number} progress - Прогресс загрузки.
 * @param {Blob} slice - Блок данных.
 */
const sendFileSlice = (progress, slice) => {
    fileReader.readAsArrayBuffer(slice);
    fileReader.onload = (evt) => {
        let arrayBuffer = fileReader.result;
        uploadFileSlice({
            name: tempFileName,
            type: tempFile.type,
            size: tempFile.size,
            alias: tempFile.name,
            data: arrayBuffer
        })
    }
}

/**
 * Отправляет серверу запрошенный блок файла.
 * @function
 * @param {Object} data - Запрошенные данные.
 */
const sendRequestedFileSlice = (data) => {
    let place = data.currentSlice * 100000,
        slice = tempFile.slice(place, place + Math.min(100000, tempFile.size - place)),
        progress = Math.round(place / tempFile.size * 100);
    console.log(data)
    sendFileSlice(progress, slice);
}

const setUserAudio = (status, user) => {

}


