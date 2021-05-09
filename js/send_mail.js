const nodemailer = require('nodemailer')

/**
 * Отправляет письмо на почту.
 * @function
 * @param {string} to - Почта клиента.
 * @param {string} userName - Имя клиента в конференции.
 * @param {string} masterName - имя создателя конференции.
 */
async function sendMail(to, userName, masterName) {
    // Почта приложения
    let transporter = nodemailer.createTransport({
        pool: true,
        service: 'gmail',
        port: 465,
        secure: true, // use TLS
        auth: {
            user: "courseworkksis@gmail.com",
            pass: "15testPassword"
        }
    });

    let mailOptions = {
        from: 'course_work_ksis@mail.ru',
        to: 'taverkin@mail.ru',
        subject: 'Join the Yes! conference!',
        text: 'Hello, ' + userName + ", you've joined " + masterName + "'s conference."
    };
    console.log('Hello, ' + userName + ", you've joined " + masterName + "'s conference.");
    let respond = await transporter.sendMail(mailOptions);
    /*
    function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    }
     */
    return true;

}
