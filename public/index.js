//const socket = io('http://localhost:4000');
// const desktopCapturer = require('electron')
const socket = io(mainUrl);

const peer = new Peer();
const $ = require('jquery')

// let roomID = "room"
let myVideoStream;
let myId;
let otherStreams = [];

let videoGrid = document.getElementById('videoDiv')
let myvideo = document.createElement('video');
let screen_video = document.createElement('video');
myvideo.muted = true;
const peerConnections = {}

let capturedStream;
let capturingScreen = false
let callScreen

let videoTracks;
let audioTracks;

let filePathMap = []

ioClient = socket.connect(mainUrl)
// ioClient = socket.connect('http://192.168.100.5:4000')
ioClient.on('connect', socket => {
    ioClient.send('room')
})

function workWithStream(stream) {
    myVideoStream = stream;
    videoTracks = stream.getVideoTracks();
    audioTracks = stream.getAudioTracks();
    addVideo(myvideo , stream, 'self');
    peer.on('call' , call =>{
        //  || (peerConnections.indexOf(call) > -1)
        // alert(capturingScreen)
        // alert(call.metadata.id)
        if ((!capturingScreen)) {
            if (otherStreams.indexOf(call.metadata.id) < 0) {
                call.answer(myVideoStream);
                peerConnections[call.metadata.id] = call
                const vid = document.createElement('video');
                call.on('stream', userStream => {
                    if (otherStreams.indexOf(call.metadata.id) < 0) {
                        addVideo(vid, userStream, call.metadata.id);
                        otherStreams.push(call.metadata.id)
                    }
                })
                call.on('error', (err) => {
                    alert(err)
                })
                call.on('close', () => {
                    document.getElementById(call.metadata.id).remove()
                })
            }
        }
        else {
            call.answer(capturedStream)
        }
    })
}

async function getMedia(constraints) {
    let stream = null;

    stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then((stream) => {
        return stream
    }).catch(err => {
        return null
    })

    console.log(stream)
    return stream
}

function getMediaLaunch() {
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then((stream) => {
        workWithStream(stream)
    }).catch(err => {
        navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
        }).then((stream) => {
            workWithStream(stream)
        }).catch(err => {
            // TODO: work with client when no stream
        })
    })
}

getMediaLaunch()

peer.on('open' , (id)=>{
    myId = id;
    activeUser.id = id
    socket.emit("newUser" , id , roomID);
})

peer.on('error' , (err)=>{
    alert(err.type);
});

function callUser(id) {
    const call  = peer.call(id , myVideoStream, {metadata: {id: activeUser.id }});
    peerConnections[id] = call;
    let count_connect = 0;
    const vid = document.createElement('video');
    call.on('error' , (err)=>{
        alert(err);
    })
    call.on('stream' , userStream=>{
        if (count_connect === 0) {
            addVideo(vid, userStream, id);
            count_connect++
        }
    })
    call.on('close' , ()=>{
        //vid.remove();
        document.getElementById(id).remove()
    })
}

socket.on('userJoined' , id => {
    alert("new")
    callUser(id)
})

socket.on('userDisconnect' , id=>{
    if(peerConnections[id]){
        peerConnections[id].close();
    }
})

socket.on('screenCaptured' , id=>{
    const call  = peer.call(id , myVideoStream);
    const vid = document.createElement('video');
    //callScreen = call
    call.on('error' , (err)=>{
        alert(err);
    })
    call.on('stream' , userStream=>{
        document.getElementById('vid-pad').style.height = '100%'
        document.getElementById('vid-main-block').style.flexGrow = '1'
        document.getElementById('vid-panel').style.flexGrow = '0'
        document.getElementById('control-panel').className = 'disabled-control-panel'
        document.getElementById('screen-select').disabled = true
        setMainVid(userStream)
    })
    call.on('close' , ()=>{
        socket.emit('capturingStopped')
    })
    // peerConnections[id] = call;
})

socket.on('capturingStopped', () => {
    document.getElementById('vid-pad').style.height = '0'
    document.getElementById('vid-main-block').style.flexGrow = '0'
    document.getElementById('vid-panel').style.flexGrow = '1'
    document.getElementById('control-panel').className = 'active-control-panel'
    document.getElementById('screen-select').disabled = false
})

function setVideo(stream, user) {
    let video = document.querySelector('#' + user + ' video')
    console.log('set')
    console.log(stream)
    video.srcObject = stream;
}

function addVideo(video , stream, user){
    if (document.getElementById(user)) {
        setVideo(stream, user)
        return
    }

    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })

    let gridElement = document.querySelector('#user-video-template').content.cloneNode(true)
    gridElement.children[0].appendChild(video)
    gridElement.children[0].id = user
    videoGrid.appendChild(gridElement.children[0])
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
/*
document.getElementById("screen-stream").onclick = function(event){
    if (captureScreen == null) {
        captureScreen = startCapture()
    }
    else {
        captureScreen = null
    }
}
*/
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
                    addVideo(screen_video, stream, 'r')
                } catch (e) {
                    console.log(e)
                }
                return
            }
        }
    })
}

// Stream control
function shutDownOtherAudio(userID) {
    socket.emit("shutDownUserAudio", userID, activeUser.room)
}

function shutDownOtherVideo(userID) {
    socket.emit("shutDownUserVideo", userID, activeUser.room)
}

let tempTrack
function shutDownSelfVideo() {
    if (videoTracks[0].enabled) {
    //myvideo = document.querySelector('#self video')
    //if (videoTracks[0].readyState === 'live') {
        videoTracks[0].enabled = false
        document.getElementById("video-stream-control").className = 'btn btn-danger'
        document.getElementById('self').children[2].style.display = 'none'
        document.getElementById('self').children[1].style.display = 'block'

        //videoTracks[0].stop()
        socket.emit("DisableVideo", activeUser)
    }
    else {
        videoTracks[0].enabled = true
        /*
        let stream = await getMedia({ video: true, audio: true })
        if (stream != null) {
            myVideoStream = stream
            videoTracks = myVideoStream.getVideoTracks()
            audioTracks = myVideoStream.getAudioTracks()
            console.log(myvideo)
            myvideo.srcObject = myVideoStream
        }
        */

        socket.emit("EnableVideo", activeUser)
        document.getElementById("video-stream-control").className = 'btn btn-success'
        document.getElementById('self').children[1].style.display = 'none'
        document.getElementById('self').children[2].style.display = 'block'
    }
}

function shutDownSelfAudio() {
    if (audioTracks[0].enabled) {
        audioTracks[0].enabled = false
        socket.emit("DisableAudio", activeUser)
        document.getElementById("audio-stream-control").className = 'btn btn-danger'
    }
    else {
        audioTracks[0].enabled = true
        socket.emit("EnableAudio", activeUser)
        document.getElementById("audio-stream-control").className = 'btn btn-success'
    }
}

socket.on('shutMeDownAudio', () => {
    shutDownSelfAudio()
})

socket.on('shutMeDownVideo', () => {
    shutDownSelfVideo()
})

socket.on('userDisableAudio', function(id) {
    document.getElementById(id).children[0].style.display = 'block'
})

socket.on('userEnableAudio', function(id) {
    document.getElementById(id).children[0].style.display = 'none'
})

socket.on('userDisableVideo', function(id) {
    document.getElementById(id).children[1].style.display = 'block'
    document.getElementById(id).children[2].style.display = 'none'
})

socket.on('userEnableVideo', function(id) {
    callUser(id)
    document.getElementById(id).children[2].style.display = 'block'
    document.getElementById(id).children[1].style.display = 'none'
})


////////// UPLOADING
const uploadFileSlice = (slice) => {
    socket.emit("client-send-file-slice", activeUser, slice)
}

socket.on("SERVER_REQUEST_FILE_SLICE", function (slice) {
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

                URL.revokeObjectURL(link.href)
            }
        })
    }
})

