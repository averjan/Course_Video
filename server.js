//import Storage from "./js/storage";
const Storage = require('./js/storage.js')
const utils = require('./utils.js')


const fs = require('fs');
const express = require('express');
const app = express();
const config = require('./config')
const mmm = require('mmmagic')
var Magic = require('mmmagic').Magic;
const ejs = require('ejs')

let port = process.env.PORT || 4000,
secure = config.secure || false;

let server = require('http').createServer(app);

let mainScreenUser = -1
let rooms = []
/*
if (secure)
{
    const options = {
        key: fs.readFileSync(config.secure_key),
        cert: fs.readFileSync(config.secure_cert)
    }

    server = require('https').createServer(options, app);
}
else
{
    server = require('http').createServer(app);
}
*/

// const md5 = require("md5");
const storage = new Storage()
const io = require("socket.io")(server);

const {v4:uuidv4} = require('uuid');
const {ExpressPeerServer} = require('peer')
const peer = ExpressPeerServer(server , {
    debug:true
});
app.use('/peerjs', peer);
//app.set('views engine', 'ejs')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.get('/' , (req,res)=>{
    res.send(uuidv4());
});

app.get('/room/:room' , (req,res)=>{
    console.log("swag room");
    console.log(req.params.room)
    console.log("end params");
    //res.render('index' , {RoomId:req.params.room});
    // res.render('index' , {RoomId : req.params.room});
    let page = fs.readFileSync('views/index1.ejs', 'utf-8')
    console.log(page)
    let renderedPage = ejs.render(page, {RoomId : req.params.room})
    res.send(renderedPage)
    //res.render('index1' , {RoomId : req.params.room});
});

app.get('/files/:fileName', function (req, res, next) {
    console.log("download file")
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

app.get('/checkRoom/:id', function(req, res, next) {
    let newID = req.params.id
    //const rooms = io.of("/").adapter.rooms;
    // console.log(io.sockets.adapter.rooms)
    if (typeof rooms[newID] != 'undefined') {
        res.json({ status: true })
    }
    else {
        res.json({ status: false })
    }
    /*
    let statusFound = false
    rooms.forEach(r => {
        if (r.name === newID) {
            statusFound = true
        }
        console.log(r.name + " " + newID)
    })

    if (statusFound) {
        console.log(true)
        res.json({ status: true })
    }
    else {
        console.log(false)
        res.json({ status: false })
    }
    */
})

io.on("connection" , socket => {
    socket.on('newUser' , (id , room)=>{
        socket.join(room);
        //rooms.push({ name: room, screen: -1, users: [id] })
        if (typeof rooms[room] == 'undefined') {
            rooms[room] = { screen: -1, users: [{ id: id, socket: socket }]}
        }
        else {
            rooms[room].users.push({ id: id, socket: socket })
        }
        //socket.to(room).emit('userJoined' , id);
        socket.broadcast.to(room).emit('userJoined' , id);
        console.log("captured screen")

        socket.on('disconnect' , ()=>{
            //socket.to(room).broadcast.emit('userDisconnect' , id);
            //socket.to(room).emit('userDisconnect' , id);
            let currentRoom = rooms[room]
            rooms[room].users.splice(currentRoom.users.indexOf({ id: id, socket: socket }), 1)
            if (currentRoom.users.length === 0) {
                //rooms.splice(rooms.indexOf(currentRoom), 1)
                rooms[room] = undefined
            }

            socket.broadcast.to(room).emit('userDisconnect' , id);
        })
    })


    socket.on("screenCaptured", (id, room)=>{
        rooms[room].screen = id
        console.log(id)
        socket.broadcast.to(room).emit('screenCaptured' , id);
    })

    socket.on("synchronizeScreen", (room) => {
        if (rooms[room].screen !== -1) {
            socket.emit('screenCaptured', rooms[room].screen)
        }

    })

    socket.on("stopCapturing", (room, id) => {
        rooms[room].screen = -1
        socket.broadcast.to(room).emit('capturingStopped')
    })

    socket.on("getScreen", id=>{
        if (mainScreenUser !== -1) {
            console.log("hi bih")
            io.to(socket.id).emit('screenCaptured', mainScreenUser);
        }
    })

    socket.on('chat message', (msg, room) =>{
        io.to(room).emit('chat message', msg)
    })

    socket.on('client-send-file-slice', (id, slice, room) =>{
        console.log("start file")
        storeFileSlice(socket, id, slice, room);
    })


    // Stream control
    socket.on('shutDownUserAudio', (userID, room) => {
        console.log(userID)
        let destSocket = rooms[room].users.find((e, i, a) => {
            return e.id === userID
        })

        destSocket.socket.emit('shutMeDownAudio')
    })

    socket.on('shutDownUserVideo', (userID, room) => {
        console.log(userID)
        let destSocket = rooms[room].users.find((e, i, a) => {
            return e.id === userID
        })

        destSocket.socket.emit('shutMeDownVideo')
    })

    socket.on("DisableAudio", (id, room) =>{
        io.to(room).emit('userDisableAudio', id)
    })
    socket.on("EnableAudio", (id, room) =>{
        io.to(room).emit('userEnableAudio', id)
    })
    socket.on("DisableVideo", (id, room) =>{
        io.to(room).emit('userDisableVideo', id)
    })
    socket.on("EnableVideo", (id, room) =>{
        io.to(room).emit('userEnableAudio', id)
    })
})

function storeFileSlice(socket, user, data, room) {
    storage.storeFileSlice(data);
    let complete = storage.fileIsComplete(data.name);
    if(complete) {
        console.log("FILE COMPLETE!");
        let res = storage.finalizeFile(data.name);
        if(!res.err) {
            socket.emit('SERVER_FINISH_RECEIVE_FILE');
            //socket.broadcast.to(room).emit('CHAT_FILE', {
            io.to(room).emit('CHAT_FILE', {
                user: user.name,
                file: {
                    name: res.alias,
                    size: res.size,
                    path: '/files/' + res.name,
                    ext: res.name.split('.').pop().toUpperCase(),
                },
                time: utils.getSimpleTime(),
                color: user.color,
            });
            /*
            this.broadcastServerLog({
                type: events.SERVER_FILE,
                user: user.name,
                message: res.alias,
                room: room,
            })
             */
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

server.listen(port , ()=>{
    console.log("Server running on port : " + port);
})
