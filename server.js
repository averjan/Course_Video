
const Storage = require('./js/storage.js')
const utils = require('./utils.js')

const fs = require('fs');
const express = require('express');
const app = express();
const config = require('./config')
const mmm = require('mmmagic')
var Magic = require('mmmagic').Magic;
const ejs = require('ejs')

let port = process.env.PORT || 4000

let server = require('http').createServer(app);

let rooms = []

const storage = new Storage()
const io = require("socket.io")(server);

const {v4:uuidv4} = require('uuid');
const {ExpressPeerServer} = require('peer')
const peer = ExpressPeerServer(server , {
    debug:true
});
app.use('/peerjs', peer);
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.get('/' , (req,res)=>{
    res.send(uuidv4());
});

app.get('/room/:room' , (req,res)=>{
    let page = fs.readFileSync('views/index1.ejs', 'utf-8')
    let renderedPage = ejs.render(page, {RoomId : req.params.room})
    res.send(renderedPage)
});

// Handle file download request
app.get('/files/:fileName', function (req, res, next) {
    let fileName = req.params.fileName;
    let path = __dirname + `/js/upload/${fileName}`;
    let magic = new Magic(mmm.MAGIC_MIME_TYPE);
    magic.detectFile(path, (err, type) => {
        if (err) throw err;
        fs.readFile(path, (err, data) => {
            if (err) throw err;
            res.json({
                type: type,
                data: data,
            });
        });
    });

})

// Check if room empty
app.get('/checkRoom/:id', function(req, res, next) {
    let newID = req.params.id
    if (typeof rooms[newID] != 'undefined') {
        res.json({ status: true, master: rooms[newID].master, })
    }
    else {
        res.json({ status: false, master: null, })
    }
})

// Handle connection from socket
io.on("connection" , socket => {
    // Handle socket request that checks if any of users in the room is sharing screen now
    socket.on("synchronizeScreen", (room) => {
        if (rooms[room].screen !== -1) {
            socket.emit('screenCaptured', rooms[room].screen)
        }
    })

    // Handle joining new user to room
    socket.on('newUser' , (user)=>{
        let id = user.id
        let room = user.room
        socket.join(user.room);
        if (typeof rooms[user.room] == 'undefined') {
            rooms[user.room] = { screen: -1, users: [{ id: user.id, socket: socket }], master: user.name, }
        }
        else {
            rooms[user.room].users.push({ id: user.id, socket: socket })
        }

        socket.emit('synchronizeScreen', user.room)
        socket.broadcast.to(user.room).emit('userJoined' , user);

        // Handle socket disconnect
        socket.on('disconnect' , ()=>{
            let currentRoom = rooms[room]
            rooms[room].users.splice(currentRoom.users.indexOf({ id: id, socket: socket }), 1)
            if (rooms[room].users.length === 0) {
                rooms[room] = undefined
            }
            else if (rooms[room].screen === id) {
                socket.broadcast.to(room).emit('capturingStopped')
            }

            socket.broadcast.to(room).emit('userDisconnect' , id);
        })
    })


    socket.on("screenCaptured", (id, room)=>{
        rooms[room].screen = id
        socket.broadcast.to(room).emit('screenCaptured' , id);
    })

    socket.on("stopCapturing", (room, id) => {
        rooms[room].screen = -1
        socket.broadcast.to(room).emit('capturingStopped')
    })

    socket.on('chat message', (msg, user) =>{
        io.to(user.room).emit('chat message', msg, user)
    })

    socket.on('client-send-file-slice', (user, slice) =>{
        storeFileSlice(socket, user, slice, user.room);
    })


    // Stream control
    socket.on('shutDownUserAudio', (userID, room) => {
        let destSocket = rooms[room].users.find((e, i, a) => {
            return e.id === userID
        })

        destSocket.socket.emit('shutMeDownAudio')
    })

    socket.on('shutDownUserVideo', (userID, room) => {
        let destSocket = rooms[room].users.find((e, i, a) => {
            return e.id === userID
        })

        destSocket.socket.emit('shutMeDownVideo')
    })

    // User disabled audio signal
    socket.on("DisableAudio", (user) =>{
        socket.broadcast.to(user.room).emit('userDisableAudio', user.id)
    })

    // User enabled audio signal
    socket.on("EnableAudio", (user) =>{
        socket.broadcast.to(user.room).emit('userEnableAudio', user.id)
    })

    // User disabled video signal
    socket.on("DisableVideo", (user) =>{
        socket.broadcast.to(user.room).emit('userDisableVideo', user.id)
    })

    // User enabled video signal
    socket.on("EnableVideo", (user) =>{
        socket.broadcast.to(user.room).emit('userEnableVideo', user.id)
    })
})

// Save uploaded file slice
function storeFileSlice(socket, user, data, room) {
    storage.storeFileSlice(data);
    let complete = storage.fileIsComplete(data.name);
    if(complete) {
        console.log("FILE COMPLETE!");
        let res = storage.finalizeFile(data.name);
        if(!res.err) {
            socket.emit('SERVER_FINISH_RECEIVE_FILE');
            io.to(room).emit('CHAT_FILE', {
                user: user,
                file: {
                    name: res.alias,
                    size: res.size,
                    path: '/files/' + res.name,
                    ext: res.name.split('.').pop().toUpperCase(),
                },
                time: utils.getSimpleTime(),
                color: user.color,
            });
        } else {
            socket.emit('SERVER_ERROR_RECEIVE_FILE', res.err);
        }
    } else {
        console.log("REQUEST FILE SLICE!");
        socket.emit('SERVER_REQUEST_FILE_SLICE', {
            currentSlice: storage.getCurrentFileSlice(data.name)
        });
    }
}

// Start listening port for connections
server.listen(port , ()=>{
    console.log("Server running on port : " + port);
})
