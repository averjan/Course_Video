const { UserApp } = require('../public/client/user')
let file;
let uploading = false;
let fileReader;
let tempFile;
let tempFileName;
let roomID = 'room';
const mainUrl = "http://localhost:4000"

// temp initialized user
let activeUser = new UserApp('name', 'email', '', roomID, ROLE.admin)

const MICRO = {
    on: true,
    off: false
}

const VIDEO = {
    on: true,
    off: false
}
