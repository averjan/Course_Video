const fs = require('fs');
const express = require('express');
const app = express();
const config = require('./config')

let port = process.env.PORT || 4000,
secure = config.secure || false;

let server = require('http').createServer(app);

let mainScreenUser = -1
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

app.get('/:room' , (req,res)=>{
    console.log("swag room");
    console.log(req.params.room)
    console.log("end params");
    //res.render('index' , {RoomId:req.params.room});
    res.render('index' , {RoomId : req.params.room});
});

io.on("connection" , socket => {
    console.log("swage")

    socket.on('newUser' , (id , room)=>{
        socket.join(room);
        console.log("swag2")
        //socket.to(room).emit('userJoined' , id);
        socket.broadcast.to(room).emit('userJoined' , id);
        console.log("captured screen")

        //socket.to(room).broadcast.emit('userJoined' , id);
        socket.on('disconnect' , ()=>{
            //socket.to(room).broadcast.emit('userDisconnect' , id);
            //socket.to(room).emit('userDisconnect' , id);
            socket.broadcast.to(room).emit('userDisconnect' , id);
        })
    })


    socket.on("screenCaptured", (id, room)=>{
        mainScreenUser = id
        socket.broadcast.to(room).emit('screenCaptured' , id);
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
server.listen(port , ()=>{
    console.log("Server running on port : " + port);
})
