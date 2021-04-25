const { UserApp } = require('../public/client/user')
//const { ROLE } = require('../js/roles')
let file;
let uploading = false;
let fileReader;
let tempFile;
let tempFileName;
let roomID = 'room';
const mainUrl = "http://192.168.100.6:4000"

// temp initialized user
let activeUser // = new UserApp('name', 'email', '', roomID, ROLE.admin)
// main.js: sendRoomId event - decomment
const MICRO = {
    on: true,
    off: false
}

const VIDEO = {
    on: true,
    off: false
}
