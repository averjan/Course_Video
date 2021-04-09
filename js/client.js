////// File sharing
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
    let place = data * 100000,
        slice = tempFile.slice(place, place + Math.min(100000, tempFile.size - place)),
        progress = Math.round(place / tempFile.size * 100);
    sendFileSlice(progress, slice);
}
