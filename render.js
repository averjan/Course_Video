//const { desktopCapturer, remote, Menu, dialog } = require('electron');
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

/*
const startBtn = document.getElementById('screen-stream');
startBtn.onclick = e => {
    mediaRecorder.start();
    startBtn.classList.add('is-danger');
    startBtn.innerText = 'Recording';
};


const stopBtn = document.getElementById('screen-stop');

stopBtn.onclick = e => {
    mediaRecorder.stop();
    startBtn.classList.remove('is-danger');
    startBtn.innerText = 'Start';
};
*/

const mainVidPad = document.getElementById('vid-pad')
const mainVideoScreen = document.getElementById('vid-main')

const videoSelectBtn = document.getElementById('screen-select');
videoSelectBtn.onclick = getVideoSources;

const videoCancelShareBtn = document.getElementById('screen-cancel-select');
videoCancelShareBtn.hidden = true;
videoCancelShareBtn.onclick = cancelVideoSources

// Get the available video sources
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

// Change the videoSource window to record
async function selectSource(source) {

    // videoSelectBtn.innerText = source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };

    // Create a Stream
    const stream = await navigator.mediaDevices
        .getUserMedia(constraints);

    //myVideoStream.addTrack(stream.getTracks()[0])
    capturedStream = stream
    mainVidPad.style.height = '100%'
    document.getElementById('vid-main-block').style.flexGrow = '1'
    document.getElementById('vid-panel').style.flexGrow = '0'
    document.getElementById('control-panel').className = 'disabled-control-panel'
    //let ms = new MediaStream([myVideoStream.getTracks()[2]])
    /*
    let mainVideo = document.getElementById("vid-main")
    mainVideo.srcObject = stream;
    mainVideo.addEventListener('loadedmetadata', () => {
        mainVideo.play()
    })
    */
    setMainVid(capturedStream)
    //addVideo(mainVideo, capturedStream)

    capturingScreen = true
    /*
    peerCapture.on("call", call=> {
        call.answer(stream)
    })
    */

    socket.emit("screenCaptured", myId, roomID)
    videoSelectBtn.hidden = true
    videoCancelShareBtn.hidden = false
    // Preview the source in a video element
    //videoElement.srcObject = stream;
    //await videoElement.play();

    // Create the Media Recorder
    /*
    const options = { mimeType: 'video/webm; codecs=vp9' };
    mediaRecorder = new MediaRecorder(stream, options);

    // Register Event Handlers
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
    */
    // Updates the UI
}

function cancelVideoSources()
{
    capturingScreen = false
    videoCancelShareBtn.hidden = true
    videoSelectBtn.hidden = false
    capturedStream.getTracks()[0].stop()
    console.log(document.getElementById('vid-main').srcObject)
    mainVidPad.style.height = '0'
    document.getElementById('vid-main-block').style.flexGrow = '0'
    document.getElementById('vid-panel').style.flexGrow = '1'
    document.getElementById('control-panel').className = 'active-control-panel'
    // document.getElementById("screen-share").remove()
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
