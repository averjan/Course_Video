const socket = io('http://localhost:4000');
const peer = new Peer();

let roomID = "room"
let myVideoStream;
let myId;
let videoGrid = document.getElementById('videoDiv')
let myvideo = document.createElement('video');
myvideo.muted = true;
const peerConnections = {}

let videoTracks;
let audioTracks;

ioClient = socket.connect('http://localhost:4000')
ioClient.on('connect', socket => {
    ioClient.send('room')
})

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then((stream)=>{
    myVideoStream = stream;
    videoTracks = stream.getVideoTracks();
    audioTracks = stream.getAudioTracks();
    addVideo(myvideo , stream);
    peer.on('call' , call=>{
        call.answer(stream);
        const vid = document.createElement('video');
        call.on('stream' , userStream=>{
            addVideo(vid , userStream);
        })
        call.on('error' , (err)=>{
            alert(err)
        })
    })
}).catch(err=>{
    alert("two")
    alert(err.message)
})

peer.on('open' , (id)=>{
    //alert("nol")
    myId = id;
    socket.emit("newUser" , id , roomID);
})
peer.on('error' , (err)=>{
    alert(err.type);
});
socket.on('userJoined' , id=>{
    alert("new")
    const call  = peer.call(id , myVideoStream);
    const vid = document.createElement('video');
    call.on('error' , (err)=>{
        alert(err);
    })
    call.on('stream' , userStream=>{
        addVideo(vid , userStream);
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
function addVideo(video , stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video);
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
