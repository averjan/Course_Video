const socket = io('http://192.168.1.102:4000');
const peer = new Peer();

let roomID = "room"
let myVideoStream;
let myId;
let videoGrid = document.getElementById('videoDiv')
let myvideo = document.createElement('video');
myvideo.muted = true;
const peerConnections = {}

ioClient = socket.connect('http://192.168.1.102:4000')
ioClient.on('connect', socket => {
    ioClient.send('room')
})

navigator.mediaDevices.getUserMedia({
    //video:true,
    audio:true
}).then((stream)=>{
    myVideoStream = stream;
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
    alert("nol")
    myId = id;
    socket.emit("newUser" , id , roomID);
})
peer.on('error' , (err)=>{
    alert(err.type);
});
socket.on('userJoined' , id=>{
    console.log("new user joined")
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
