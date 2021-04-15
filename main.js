const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')
const path = require('path')

let defaultWindow;
let userRoomID;

function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('views/login.html')
    defaultWindow = win
    //win.loadFile('views/index.html')
    //win.loadURL('http://localhost:4000/room')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

ipcMain.on("changeRoom", (event, roomID) => {
    defaultWindow.loadFile('views/index.html')
})

ipcMain.on("sendRoomId", (event) => {
    event.reply("getRoomId", userRoomID)
})
