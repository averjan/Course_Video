const { desktopCapturer, remote } = require('electron');
const { writeFile } = require('fs');

const { dialog, Menu } = remote;

let captureScreen;
let peerCapture = new Peer()

// Global state
let mediaRecorder; // MediaRecorder instance to capture footage
const recordedChunks = [];

// Buttons
const videoElement = document.createElement('video');
const mainVidPad = document.getElementById('vid-pad')
const mainVideoScreen = document.getElementById('vid-main')

const videoSelectBtn = document.getElementById('screen-select');
videoSelectBtn.onclick = getVideoSources;

const videoCancelShareBtn = document.getElementById('screen-cancel-select');
videoCancelShareBtn.hidden = true;
videoCancelShareBtn.onclick = cancelVideoSources

/**
 * Получение доступных источников медиа.
 * @function
 */
async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            };
        })
    );

    videoOptionsMenu.popup();
}

/**
 * Получает видеоизображение выбранного окна.
 * @function
 * @param {Electron.DesktopCapturerSource} source - Источник видеопотока(демострируемое окно).
 */
async function selectSource(source) {


    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };

    // Создает объект медиапотока
    const stream = await navigator.mediaDevices
        .getUserMedia(constraints);

    capturedStream = stream
    mainVidPad.style.height = '100%'
    document.getElementById('vid-main-block').style.flexGrow = '1'
    document.getElementById('vid-panel').style.flexGrow = '0'
    document.getElementById('control-panel').className = 'disabled-control-panel'

    setMainVid(capturedStream)

    capturingScreen = true
    socket.emit("screenCaptured", myId, roomID)
    videoSelectBtn.hidden = true
    videoCancelShareBtn.hidden = false
}

/**
 * Отключает демонстрацию экрана.
 * @function
 */
function cancelVideoSources()
{
    capturingScreen = false
    videoCancelShareBtn.hidden = true
    videoSelectBtn.hidden = false
    capturedStream.getTracks()[0].stop()
    socket.emit('stopCapturing', activeUser.room, activeUser.id)
    mainVidPad.style.height = '0'
    document.getElementById('vid-main-block').style.flexGrow = '0'
    document.getElementById('vid-panel').style.flexGrow = '1'
    document.getElementById('control-panel').className = 'active-control-panel'
}

// Captures all recorded chunks
function handleDataAvailable(e) {
    console.log('video data available');
    recordedChunks.push(e.data);
}

// Saves the video file on stop
async function handleStop(e) {
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save video',
        defaultPath: `vid-${Date.now()}.webm`
    });

    if (filePath) {
        writeFile(filePath, buffer, () => console.log('video saved successfully!'));
    }

}
