
const getSimpleTime = () => {
    let d = new Date();
    return `${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}`;
}

const getCommandLine = () => {
    switch (process.platform) {
        case 'darwin' : return 'open';
        case 'win32' : return 'start';
        case 'win64' : return 'start';
        default : return 'xdg-open';
    }
}

exports.getSimpleTime = getSimpleTime;
exports.getCommandLine = getCommandLine;
