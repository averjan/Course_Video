const { ipcRenderer } = require('electron')
const { UserApp } = require('../public/client/user')

function openForm() {
    let panel = document.getElementById("chat-panel");
    panel.style.display = (panel.style.display === "flex") ? "none" : "flex"
}

document.getElementById("select-file-input").addEventListener('change', (event) => {
    file = event.target.files[0];
})

document.getElementById("send-btn").addEventListener('click', (event) =>{
    document.getElementById("select-file-input").value = '';
    if (file) {
        shareFile(file)
        file = null
    }
})

function loadBody() {
    ipcRenderer.send("sendRoomId")
}

ipcRenderer.on("getRoomId", (event, userData) => {
    roomID = userData.roomId
    activeUser = new UserApp(userData.userName, userData.userMail, '', userData.roomId, userData.role)
})

function changeAudioState(e) {
    if (e.alt === "on") {
        e.src = "../img/icons/micro_off.svg"
        e.alt = "off"
    }
    else {
        e.src = "../img/icons/micro_on.svg"
        e.alt = "on"
    }
}

