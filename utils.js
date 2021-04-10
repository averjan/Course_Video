
const getSimpleTime = () => {
    let d = new Date();
    return `${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}`;
}

exports.getSimpleTime = getSimpleTime;
