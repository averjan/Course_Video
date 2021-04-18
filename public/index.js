//const socket = io('http://localhost:4000');
// const desktopCapturer = require('electron')
const socket = io(mainUrl);
const peer = new Peer();
const $ = require('jquery')

// let roomID = "room"
let myVideoStream;
let myId;
let videoGrid = document.getElementById('videoDiv')
let myvideo = document.createElement('video');
let screen_video = document.createElement('video');
myvideo.muted = true;
const peerConnections = {}
let capturedStream;
let capturingScreen = false

let videoTracks;
let audioTracks;

let filePathMap = []

ioClient = socket.connect(mainUrl)
// ioClient = socket.connect('http://192.168.100.5:4000')
ioClient.on('connect', socket => {
    ioClient.send('room')
})

navigator.mediaDevices.getUserMedia({
    video:false,
    audio:true
}).then((stream)=>{
    myVideoStream = stream;
    videoTracks = stream.getVideoTracks();
    audioTracks = stream.getAudioTracks();
    addVideo(myvideo , stream, activeUser.id);
    peer.on('call' , call =>{
        //  || (peerConnections.indexOf(call) > -1)
        // alert(capturingScreen)
        // alert(call.metadata.id)
        if ((!capturingScreen)) {
            call.answer(myVideoStream);
            const vid = document.createElement('video');
            call.on('stream', userStream => {
                addVideo(vid, userStream, call.metadata.id);
            })
            call.on('error', (err) => {
                alert(err)
            })
        }
        else {
            alert(capturedStream)
            call.answer(capturedStream)
        }
    })
}).catch(err=>{
    alert("two")
    alert(err.message)
})

peer.on('open' , (id)=>{
    //alert("nol")
    myId = id;
    activeUser.id = id
    socket.emit("newUser" , id , roomID);
})

peer.on('error' , (err)=>{
    alert(err.type);
});

socket.on('userJoined' , id => {
    alert("new")
    const call  = peer.call(id , myVideoStream, { metadata: {id: activeUser.id } });
    if (capturingScreen){
        peer.call(id, capturedStream, { metadata: {id: activeUser.id } })
    }

    const vid = document.createElement('video');
    call.on('error' , (err)=>{
        alert(err);
    })
    call.on('stream' , userStream=>{
        addVideo(vid , userStream, id);
    })
    call.on('close' , ()=>{
        vid.remove();
        console.log("user disconect")
    })
    peerConnections[id] = call;
})

socket.on('userDisconnect' , id=>{
    if(peerConnections[id]){
        peerConnections[id].close();
    }
})

socket.on('screenCaptured' , id=>{
    alert("caputred")
    const call  = peer.call(id , myVideoStream);
    const vid = document.createElement('video');
    call.on('error' , (err)=>{
        alert(err);
    })
    call.on('stream' , userStream=>{
        // alert(userStream.getTracks().length)
        // addVideo(vid, userStream);
        console.log("create")
        setMainVid(userStream)
    })
    call.on('close' , ()=>{
        vid.remove();
        console.log("user disconect")
    })
    // peerConnections[id] = call;
    console.log(call)
})

function addVideo(video , stream, user){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })

    let gridElement = document.querySelector('#user-video-template').content.cloneNode(true)
    gridElement.children[0].appendChild(video)
    videoGrid.appendChild(gridElement)
    //videoGrid.append(video);
}

function setMainVid(stream){
    let mainVideo = document.getElementById("vid-main")
    mainVideo.srcObject = stream;
    mainVideo.addEventListener('loadedmetadata', () => {
        mainVideo.play()
    })
}
// Capture screen

document.getElementById("screen-stream").onclick = function(event){
    if (captureScreen == null) {
        captureScreen = startCapture()
    }
    else {
        captureScreen = null
    }
}

/*
async function startCapture() {
    const displayMediaOptions = {video: false, audio: false}
    try {
        captureScreen = await navigator.mediaDevices.getDisplayMedia({video:true});
        screen_video.srcObject = captureScreen;
        peer.on('call' , call=>{
            call.answer(captureScreen);
        })
    } catch(err) {
        console.error("Error: " + err);
    }
    return captureScreen;
}
*/

async function startCapture() {
    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        for (const source of sources) {
            if (source.name === 'Electron') {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: source.id,
                                minWidth: 1280,
                                maxWidth: 1280,
                                minHeight: 720,
                                maxHeight: 720
                            }
                        }
                    })
                    addVideo(screen_video, stream)
                } catch (e) {
                    console.log(e)
                }
                return
            }
        }
    })
}

// Stream control
document.getElementById("video-stream-control").onclick = function(event){
    if (videoTracks[0].enabled) {
        videoTracks[0].enabled = false
        socket.emit("DisableVideo", myId, roomID)
    }
    else {
        videoTracks[0].enabled = true
        socket.emit("EnableVideo", myId, roomID)
    }
}

document.getElementById("audio-stream-control").onclick = function(event){
    if (audioTracks[0].enabled) {
        audioTracks[0].enabled = false
        socket.emit("DisableAudio", myId, roomID)
    }
    else {
        audioTracks[0].enabled = true
        socket.emit("EnableAudio", myId, roomID)
    }
}

socket.on('userDisableAudio', function(id) {
    alert("disable");
})
socket.on('userEnableAudio', function(id) {

})
socket.on('userDisableVideo', function(id) {

})
socket.on('userEnableVideo', function(id) {

})


////////// UPLOADING
const uploadFileSlice = (slice) => {
    socket.emit("client-send-file-slice", myId, slice, roomID)
}

socket.on("request-file-slice", function (slice) {
    sendRequestedFileSlice(slice)
})

socket.on("SERVER_FINISH_RECEIVE_FILE", function(){

})

socket.on("CHAT_FILE", function (file) {
    appendFileToChat(file)
})

let callToDownload

$(function() {
    callToDownload = function (file, id) {
        let fileName = file.textContent
        let path = filePathMap[id]
        alert(fileName)
        $.ajax({
            type: 'GET',
            url: mainUrl + path,
            success: function (data) {
                let blob = new Blob([new Uint8Array(data.data.data)], {
                    type: data.type
                });
                let link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = fileName;
                // console.log(data);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        })
    }
})

