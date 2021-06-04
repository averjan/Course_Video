const socket = io(mainUrl);

const peer = new Peer();
const $ = require('jquery')

let myVideoStream = null;
let myId;
let otherStreams = [];

let videoGrid = document.getElementById('videoDiv')
let myvideo = document.createElement('video');
let screen_video = document.createElement('video');
myvideo.muted = true;
const peerConnections = {}
const usersVideo = []

let capturedStream;
let capturingScreen = false
let callScreen

let videoTracks = [];
let audioTracks = [];

let filePathMap = []

ioClient = socket.connect(mainUrl)
ioClient.on('connect', socket => {
    ioClient.send('room')
})

/**
 * Настройка медиапотоков пользователя на отправку другим пользователям и отображения на экране пользователя.
 * @function
 * @param {MediaStream} stream - Медиапотоки пользователя.
 */
function workWithStream(stream) {
    myVideoStream = stream;
    videoTracks = stream.getVideoTracks();
    audioTracks = stream.getAudioTracks();
    activeUser.id = peer.id
    addVideo(myvideo , stream, activeUser);
    peer.on('call' , call =>{
        if ((!capturingScreen)) {
            if (otherStreams.indexOf(call.metadata.user.id) < 0) {
                call.answer(myVideoStream);
                peerConnections[call.metadata.user.id] = call
                const vid = document.createElement('video');
                call.on('stream', userStream => {
                    if (otherStreams.indexOf(call.metadata.user.id) < 0) {
                        addVideo(vid, userStream, call.metadata.user);
                        otherStreams.push(call.metadata.user.id)
                    }
                })
                call.on('error', (err) => {
                    alert(err)
                })
                call.on('close', () => {
                    document.getElementById(call.metadata.user.id).remove()
                })
            }
        }
        else {
            call.answer(capturedStream)
        }
    })

    emitNewUser()
    socket.emit('synchronizeScreen', activeUser.room)
}

/**
 * Получение видео и аудио пользователя.
 * @function
 */
function getMediaLaunch() {
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then((stream) => {
        workWithStream(stream)
    }).catch(err => {
        // Если нет доступа к видео, то получение только аудио.
        navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
        }).then((stream) => {
            workWithStream(stream)
            setTimeout(() => shutDownSelfVideo(), 4000)
        }).catch(err => {
            // TODO: work with client when no stream
        })
    })
}

getMediaLaunch()

/**
 * Отправка сообщения о новом пользователе серверу.
 * @function
 */
const emitNewUser = () => {
    let id = peer.id
    myId = id;
    activeUser.id = id
    socket.emit("newUser", activeUser);
}

const setPeerOpen = () => {
    peer.on('open', (id) => {
        myId = id;
        activeUser.id = id
        socket.emit("newUser", activeUser);
    })
}

peer.on('error' , (err)=>{
    alert(err.type);
});

/**
 * Звонок присоединившемуся пользователю для получения его медиапотоков.
 * @function
 * @param {UserApp} user - Объект присоединившегося пользователя.
 */
function callUser(user) {
    const call  = peer.call(user.id , myVideoStream, {metadata: {user: activeUser }});
    const vid = document.createElement('video');
    call.on('error' , (err)=>{
        alert(err);
    })
    call.on('stream' , userStream=>{
        console.log('stream1')
        if (!usersVideo[user.id]) {
            addVideo(vid, userStream, user);
            usersVideo[user.id] = true
        }
    })
    call.on('close' , ()=>{
        document.getElementById(user.id).remove()
    })

    peerConnections[user.id] = call;
}

// Обработка события присоединения пользователя
socket.on('userJoined' , user => {
    callUser(user)
})

// Обработка события отключения пользователя
socket.on('userDisconnect' , id=>{
    if(peerConnections[id]){
        peerConnections[id].close();
    }
})

// Обработка события начала демонстрации экрана другим пользователем
socket.on('screenCaptured' , id=>{
    console.log(myVideoStream)
    const call  = peer.call(id , myVideoStream);
    const vid = document.createElement('video');
    console.log(call)
    call.on('error' , (err)=>{
        alert(err);
    })
    call.on('stream' , userStream=>{
        console.log('captured')
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
})

// Обработка события окончания демонстрации экрана другим пользователем
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

/**
 * Добавляет видео и аудио другого пользователя на страницу данного клиента.
 * @function
 * @param {HTMLElement} video - Почта клиента.
 * @param {MediaStream} stream - Имя клиента в конференции.
 * @param {UserApp} user - имя создателя конференции.
 */
function addVideo(video , stream, user){
    if (document.getElementById(user.id)) {
        setVideo(stream, user.id)
        return
    }

    let gridElement = document.querySelector('#user-video-template').content.cloneNode(true)
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })

    gridElement.querySelector('.user-vid').replaceChild(video, gridElement.querySelector('video'))
    gridElement.children[0].id = user.id
    if ((activeUser.admin) && (user.id === activeUser.id)) {
        let controlPnl = gridElement.querySelector('.user-vid').querySelector('.control-video')
        controlPnl.style.display = 'none'
        controlPnl.style.enabled = 'false'
    }

    gridElement.querySelector('.vid-username').innerHTML = user.name
    videoGrid.appendChild(gridElement.children[0])
}

/**
 * Добавление медиапотока для окна демонстрации экрана.
 * @function
 * @param {MediaStream} stream - Медиа поток экрана.
 */
function setMainVid(stream){
    let mainVideo = document.getElementById("vid-main")
    mainVideo.srcObject = stream;
    mainVideo.addEventListener('loadedmetadata', () => {
        mainVideo.play()
    })
}

// Функции контроля медиапотоков пользователей в конференции

/**
 * Функция администратора; отключает микрофон пользователя.
 * @function
 * @param {string} userID - Почта клиента.
 */
function shutDownOtherAudio(userID) {
    socket.emit("shutDownUserAudio", userID, activeUser.room)
}

/**
 * Функция администратора; отключает видео пользователя.
 * @function
 * @param {string} userID - Почта клиента.
 */
function shutDownOtherVideo(userID) {
    socket.emit("shutDownUserVideo", userID, activeUser.room)
}

let tempTrack

/**
 * Отключение собственного видео.
 * @function
 */
function shutDownSelfVideo() {
    if (videoTracks.length === 0 || videoTracks[0].enabled) {
        console.log(videoTracks)
        if (videoTracks.length > 0) {
            videoTracks[0].enabled = false
        }

        document.getElementById("video-stream-control").className = 'btn btn-danger'
        document.querySelector('#video-stream-control img').src = '../img/icons/video_off_white.svg'
        document.getElementById(activeUser.id).children[3].style.display = 'none'
        document.getElementById(activeUser.id).children[1].style.display = 'block'

        //videoTracks[0].stop()
        socket.emit("DisableVideo", activeUser)
    }
    else {
        videoTracks[0].enabled = true
        socket.emit("EnableVideo", activeUser)
        document.getElementById("video-stream-control").className = 'btn btn-success'
        document.getElementById(activeUser.id).children[1].style.display = 'none'
        document.getElementById(activeUser.id).children[3].style.display = 'block'
        document.querySelector('#video-stream-control img').src = '../img/icons/video_on_white.svg'
    }
}

/**
 * Отключение собственного микрофона.
 * @function
 */
function shutDownSelfAudio() {
    if (audioTracks[0].enabled) {
        audioTracks[0].enabled = false
        socket.emit("DisableAudio", activeUser)
        document.getElementById("audio-stream-control").className = 'btn btn-danger'
        document.querySelector('#audio-stream-control img').src = '../img/icons/micro_off_white.svg'
    }
    else {
        audioTracks[0].enabled = true
        socket.emit("EnableAudio", activeUser)
        document.getElementById("audio-stream-control").className = 'btn btn-success'
        document.querySelector('#audio-stream-control img').src = '../img/icons/micro_on_white.svg'
    }
}

// Обработка события сокета отключения админом микрофона данного пользователя
socket.on('shutMeDownAudio', () => {
    shutDownSelfAudio()
})

// Обработка события сокета отключения админом видео данного пользователя
socket.on('shutMeDownVideo', () => {
    shutDownSelfVideo()
})

// Обработка события сокета отключения другим пользователем микрофона
socket.on('userDisableAudio', function(id) {
    document.getElementById(id).children[0].style.display = 'block'
})

// Обработка события сокета влкючения другим пользователем микрофона
socket.on('userEnableAudio', function(id) {
    document.getElementById(id).children[0].style.display = 'none'
})

// Обработка события сокета отключения другим пользователем видео
socket.on('userDisableVideo', function(id) {
    document.getElementById(id).children[1].style.display = 'block'
    document.getElementById(id).children[3].style.display = 'none'
})

// Обработка события сокета включения другим пользователем видео
socket.on('userEnableVideo', function(id) {
    callUser(id)
    document.getElementById(id).children[3].style.display = 'block'
    document.getElementById(id).children[1].style.display = 'none'
})


////////// Загрузка файлов на сервер
/**
 * Отправка блока данных на сервер.
 * @function
 * @param {string} slice - Блок файла.
 */
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
    /**
     * Отправка запроса на получение файла с сервера.
     * @function
     * @param {HTMLElement} file - HTML элемент файла в чате.
     * @param {string} id - id файла на сервере.
     */
    callToDownload = function (file, id) {
        let fileName = file.textContent

        // Получение пути к файлу на сервере
        let path = filePathMap[id]

        // Запрос на получение файла
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
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(link.href)
                switchFileIcoToComplete(id)
            }
        })
    }
})

