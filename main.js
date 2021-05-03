const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')
const path = require('path')
// electron-packager . Yes --platform=win32 --arch=x64
let defaultWindow;
let userData;

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

    win.removeMenu()
    win.loadFile('views/login.html')
    defaultWindow = win
    //win.loadFile('views/index.html')
    //win.loadURL('http://localhost:4000/room')

    win.webContents.session.on('will-download', (event, item, webContents) => {
        // Установите путь сохранения, чтобы Electron не отображал диалоговое окно сохранения.
        item.setSavePath(app.getAppPath() + '\\tmp\\' + item.getFilename())

        item.on('updated', (event, state) => {
            if (state === 'interrupted') {
                console.log('Download is interrupted but can be resumed')
            } else if (state === 'progressing') {
                if (item.isPaused()) {
                    console.log('Download is paused')
                } else {
                    console.log(`Received bytes: ${item.getReceivedBytes()}`)
                }
            }
        })

        item.once('done', (event, state) => {
            if (state === 'completed') {
                console.log('Download successfully')
            } else {
                console.log(`Download failed: ${state}`)
            }
        })
    })

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

ipcMain.on("changeRoom", (event, roomID, userName, userMail, role) => {
    userData = {
        roomId: roomID,
        userName: userName,
        userMail: userMail,
        role: role
    }

    defaultWindow.loadFile('views/index.html')
})

ipcMain.on("sendRoomId", (event) => {
    console.log(userData)
    event.reply("getRoomId", userData)
})
