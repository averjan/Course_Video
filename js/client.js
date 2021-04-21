////// File sharing
//const md5 = require("uuid/dist/esm-browser/md5");
// const md5 = require('../node_modules/md5/md5.js')

const { getCommandLine } = require('../utils')
const exec = require('child_process').exec
const path = require('path')

function openFile(e) {
    let fileName = e.parentElement.getElementsByClassName('file-name')[0].textContent
    let filePath = path.resolve('./tmp/' + fileName)
    exec(getCommandLine() + ' ' + filePath)
}

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

const sendRequestedFileSlice = (data) => {
    let place = data.currentSlice * 100000,
        slice = tempFile.slice(place, place + Math.min(100000, tempFile.size - place)),
        progress = Math.round(place / tempFile.size * 100);
    console.log(data)
    sendFileSlice(progress, slice);
}

const setUserAudio = (status, user) => {

}


