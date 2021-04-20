const { ipcRenderer } = require('electron')
//const { UserApp } = require('../public/client/user')

const labelFileName = document.querySelector('#file-upload-div label span')

function openForm() {
    let panel = document.getElementById("chat-panel");
    panel.style.display = (panel.style.display === "flex") ? "none" : "flex"
}

document.getElementById("select-file-input").addEventListener('change', (event) => {
    file = event.target.files[0];
    let fileName = event.target.value.split( '\\' ).pop();
    labelFileName.innerHTML = fileName
    /*
    if (file) {
        document.getElementById("select-file-input").value = '';
        shareFile(file)
        file = null
    }

     */
})

document.getElementById("send-btn").addEventListener('click', (event) =>{
    document.getElementById("select-file-input").value = '';
    labelFileName.innerHTML = 'Send file'
    if (file) {
        shareFile(file)
        file = null
    }
})

function loadBody() {
    ipcRenderer.send("sendRoomId")
}

String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

ipcRenderer.on("getRoomId", (event, userData) => {
    roomID = userData.roomId
    console.log(userData)
    activeUser = new UserApp(userData.userName, userData.userMail, '', userData.roomId, userData.role)
    if (activeUser.admin) {
        let xmlString = "        <div class=\"control-video\">\n" +
            "            <img onclick=\"changeAudioState(this)\" src=\"../img/icons/micro_on.svg\" alt=\"on\" style=\"height: 40px;\">\n" +
            "            <img onclick=\"changeVideoState(this)\" src=\"../img/icons/video_on.svg\" alt=\"on\" style=\"height: 40px;\">\n" +
            "        </div>"
        let template = document.getElementById('user-video-template')
        template.innerHTML = template.innerHTML.splice(template.innerHTML.lastIndexOf('</div>'), 0, xmlString)
    }
})

function changeAudioState(e) {
    let userID = e.parentElement.parentElement.id
    shutDownOtherAudio(userID)
    if (e.alt === "on") {
        e.src = "../img/icons/micro_off.svg"
        e.alt = "off"
    }
    else {
        e.src = "../img/icons/micro_on.svg"
        e.alt = "on"
    }
}

function changeVideoState(e) {
    let userID = e.parentElement.parentElement.id
    shutDownOtherVideo(userID)
    if (e.alt === "on") {
        e.src = "../img/icons/video_off.svg"
        e.alt = "off"
    }
    else {
        e.src = "../img/icons/video_on.svg"
        e.alt = "on"
    }
}

document.getElementById("video-stream-control").onclick = function(event){
    shutDownSelfVideo()
}

document.getElementById("audio-stream-control").onclick = function(event){
    shutDownSelfAudio()
}

