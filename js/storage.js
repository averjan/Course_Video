const fs = require('fs');

let Storage = function () {
    let files = {};
    let struct = {
        name: null,
        type: null,
        alias: null,
        size: 0,
        data: [],
        slice: 0,
    };


    this.storeFileSlice = (data) => {
        if (!files[data.name]) {
            files[data.name] = Object.assign({}, struct, data);
            files[data.name].data = [];
        }

        //convert the ArrayBuffer to Buffer
        data.data = Buffer.from(new Uint8Array(data.data));

        //save the data
        files[data.name].data.push(data.data);
        console.log('data ' + data.data.length)
        files[data.name].slice++;
    }

    this.fileIsComplete = (name) => {
        console.log(files[name].size)
        let result = files[name].slice * 100000 >= files[name].size;
        return result;
    }

    this.getCurrentFileSlice = (name) => {
        return files[name].slice;
    }

    this.finalizeFile = (name) => {
        let fileBuffer = Buffer.concat(files[name].data);
        let ext = files[name].alias.split('.').pop();
        let finalName = `${files[name].name}.${ext}`
        let path = __dirname + `\\upload\\${finalName}`;
        let res = {
            alias: files[name].alias,
            size: files[name].size,
            name: finalName
        };
        console.log(fileBuffer.length)
        fs.writeFile(path, fileBuffer, {flag: 'w'}, (err) => {
            delete files[name];
            if (err) {
                res['err'] = err;
            }
        });
        return res;
    }
}

//export default Storage;
module.exports = Storage
